import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from '@aws-sdk/client-cloudfront';
import {
  getAffectedDependencyKeys,
  getDependencyPrefix,
} from '../../dependencies';
import { listS3Keys } from '../../s3';

// Receives the units-of-speech bucket's S3 notifications through SQS (which
// batches them for up to five minutes) and invalidates the CloudFront copies
// of the SEO pages built from the changed keys.

const seoBucket = process.env.SEO_BUCKET as string;
const distributionId = process.env.DISTRIBUTION_ID as string;

// Above this many pages a pair is invalidated with a single wildcard, which
// CloudFront bills as one path.
const maxPathsPerPair = 500;

const cloudFront = new CloudFrontClient({ region: 'us-east-1' });

type SqsEvent = {
  Records: Array<{ body: string }>;
};

type S3Notification = {
  Records?: Array<{ s3?: { object?: { key?: string } } }>;
};

// S3 notifications URL-encode keys and use "+" for spaces.
const decodeS3Key = (key: string) =>
  decodeURIComponent(key.replace(/\+/g, ' '));

export const getChangedKeys = (event: SqsEvent): Set<string> => {
  const keys = new Set<string>();

  for (const record of event.Records) {
    let notification: S3Notification;

    try {
      notification = JSON.parse(record.body);
    } catch {
      console.warn('Skipping a message that is not JSON', record.body);
      continue;
    }

    // s3:TestEvent, sent when the notification is configured, has no Records.
    for (const s3Record of notification.Records ?? []) {
      const key = s3Record.s3?.object?.key;

      if (key) {
        keys.add(decodeS3Key(key));
      }
    }
  }

  return keys;
};

const encodePath = (pagePath: string) =>
  '/' + pagePath.split('/').map(encodeURIComponent).join('/');

export const toInvalidationPaths = (pagePaths: Set<string>): string[] => {
  const byPair = new Map<string, string[]>();

  for (const pagePath of pagePaths) {
    const pair = pagePath.split('/')[0];
    byPair.set(pair, [...(byPair.get(pair) ?? []), pagePath]);
  }

  return [...byPair.entries()].flatMap(([pair, paths]) =>
    paths.length > maxPathsPerPair ? [`/${pair}/*`] : paths.map(encodePath)
  );
};

export const handler = async (event: SqsEvent) => {
  const changedKeys = getChangedKeys(event);
  const dependencyKeys = new Set(
    [...changedKeys].flatMap(getAffectedDependencyKeys)
  );

  const pagePaths = new Set<string>();

  for (const dependencyKey of dependencyKeys) {
    const prefix = getDependencyPrefix(dependencyKey);

    for (const markerKey of await listS3Keys(seoBucket, prefix)) {
      pagePaths.add(markerKey.slice(prefix.length));
    }
  }

  if (pagePaths.size === 0) {
    console.log(`${changedKeys.size} changed key(s), no pages affected`);
    return;
  }

  const paths = toInvalidationPaths(pagePaths);

  // A failure is thrown so SQS redelivers the batch.
  await cloudFront.send(
    new CreateInvalidationCommand({
      DistributionId: distributionId,
      InvalidationBatch: {
        CallerReference: `seo-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`,
        Paths: { Quantity: paths.length, Items: paths },
      },
    })
  );

  console.log(
    `${changedKeys.size} changed key(s), invalidated ${pagePaths.size} page(s) with ${paths.length} path(s)`,
    paths.slice(0, 50)
  );
};
