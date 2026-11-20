#!/usr/bin/env -S npx vite-node

// Syncs the SEO search data of a language pair to the SEO bucket (see
// platform/seo.tf), one object per page.
//
//   ./scripts/seo-upload-search-data.mts <source>-<target>
//
// e.g. ./scripts/seo-upload-search-data.mts de-en reads
// packages/www/seo/search-data/de-en.json, which is keyed by word slug, and
// uploads each of its values as de-en/<word slug>.json: "a-bag" becomes
// de-en/a-bag.json, the data of /de-en/a-bag-in-german.html. The render
// lambda only knows the slug from the URL, which is why the slug is the key.
//
// Objects whose content didn't change are skipped, and objects of words that
// are no longer in the file are deleted, so their pages turn into 404s.
//
// Reads SEO_BUCKET and AWS_REGION from the environment, scripts/.env.local
// (dev bucket) or scripts/.env (prod bucket).

import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  parseSeoLanguagePair,
  seoLanguagePairToString,
} from '@vocably/model-operations';
import dotenv from 'dotenv';

const scriptsDir = dirname(fileURLToPath(import.meta.url));

// dotenv never overwrites a variable that is already set, so the environment
// wins over .env.local, which wins over .env.
dotenv.config({ path: `${scriptsDir}/.env.local`, quiet: true });
dotenv.config({ path: `${scriptsDir}/.env`, quiet: true });

const concurrency = 50;

const pairArgument = process.argv[2] ?? '';
const pair = parseSeoLanguagePair(pairArgument);
if (!pair || seoLanguagePairToString(pair) !== pairArgument) {
  console.error(
    'Usage: ./scripts/seo-upload-search-data.mts <source>-<target>'
  );
  process.exit(1);
}

const bucket = process.env.SEO_BUCKET;
if (!bucket) {
  console.error('SEO_BUCKET is not set.');
  process.exit(1);
}

const dataFile = `${scriptsDir}/../packages/www/seo/search-data/${pairArgument}.json`;
if (!existsSync(dataFile)) {
  console.error(
    `No search data for ${pairArgument}: ${dataFile} doesn't exist.`
  );
  process.exit(1);
}

const data: Record<string, unknown> = JSON.parse(
  readFileSync(dataFile, 'utf8')
);

// Object key → body.
const objects = new Map<string, string>(
  Object.entries(data).map(([wordSlug, translationCards]) => [
    `${pairArgument}/${wordSlug}.json`,
    JSON.stringify(translationCards),
  ])
);

const s3 = new S3Client({ region: process.env.AWS_REGION });

// A single-part upload's ETag is the MD5 of its body.
const listExistingEtags = async (): Promise<Map<string, string>> => {
  const etags = new Map<string, string>();
  let continuationToken: string | undefined;

  do {
    const response = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: `${pairArgument}/`,
        ContinuationToken: continuationToken,
      })
    );

    for (const { Key, ETag } of response.Contents ?? []) {
      if (Key) {
        etags.set(Key, (ETag ?? '').replace(/"/g, ''));
      }
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return etags;
};

const existingEtags = await listExistingEtags();

const changedKeys = [...objects.keys()].filter(
  (key) =>
    existingEtags.get(key) !==
    createHash('md5').update(objects.get(key)!).digest('hex')
);
const removedKeys = [...existingEtags.keys()].filter(
  (key) => !objects.has(key)
);

console.log(
  `${pairArgument}: ${objects.size} pages, uploading ${
    changedKeys.length
  } and deleting ${removedKeys.length} in s3://${bucket}/${pairArgument}/`
);

let uploaded = 0;
const failed: string[] = [];
let next = 0;

const worker = async () => {
  while (next < changedKeys.length) {
    const key = changedKeys[next++];
    try {
      await s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: objects.get(key),
          ContentType: 'application/json',
        })
      );
      uploaded++;
      if (uploaded % 1000 === 0) {
        console.log(`${uploaded}/${changedKeys.length}`);
      }
    } catch (error) {
      failed.push(key);
      console.error(`Failed to upload ${key}:`, error);
    }
  }
};

await Promise.all(Array.from({ length: concurrency }, worker));

// Deleted after the upload, like the www files, and in batches of 1000, the
// most DeleteObjects accepts.
for (let i = 0; i < removedKeys.length; i += 1000) {
  const response = await s3.send(
    new DeleteObjectsCommand({
      Bucket: bucket,
      Delete: {
        Objects: removedKeys.slice(i, i + 1000).map((Key) => ({ Key })),
        Quiet: true,
      },
    })
  );

  for (const error of response.Errors ?? []) {
    failed.push(error.Key ?? '');
    console.error(`Failed to delete ${error.Key}: ${error.Message}`);
  }
}

console.log(
  `Uploaded ${uploaded}/${changedKeys.length}, deleted ${removedKeys.length}.`
);
if (failed.length > 0) {
  console.error(`${failed.length} objects failed: ${failed.join(', ')}`);
  process.exit(1);
}
