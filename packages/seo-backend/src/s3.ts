import {
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { DataSource } from './dataSource';

export const s3Client = new S3Client({ region: process.env.AWS_REGION });

const isMissingKey = (error: any): boolean =>
  error?.name === 'NoSuchKey' ||
  error?.Code === 'NoSuchKey' ||
  error?.$metadata?.httpStatusCode === 404;

export const readS3Object = async (
  bucket: string,
  key: string
): Promise<string | null> => {
  try {
    const response = await s3Client.send(
      new GetObjectCommand({ Bucket: bucket, Key: key })
    );
    return (await response.Body?.transformToString('utf-8')) ?? null;
  } catch (error) {
    if (isMissingKey(error)) {
      return null;
    }
    throw error;
  }
};

/**
 * Keeps an S3 object in memory between invocations and re-downloads it only
 * when its ETag changes, so a warm container never serves a stale template or
 * word list after a deploy.
 */
export const cachedS3Object = <T>(
  bucket: string,
  key: string,
  parse: (contents: string) => T
) => {
  let cached: { etag: string; value: T } | undefined;

  return async (): Promise<T | null> => {
    try {
      const response = await s3Client.send(
        new GetObjectCommand({
          Bucket: bucket,
          Key: key,
          IfNoneMatch: cached?.etag,
        })
      );
      const contents = await response.Body?.transformToString('utf-8');

      if (contents === undefined) {
        return null;
      }

      cached = { etag: response.ETag ?? '', value: parse(contents) };
      return cached.value;
    } catch (error: any) {
      if (error?.$metadata?.httpStatusCode === 304 && cached) {
        return cached.value;
      }

      if (isMissingKey(error)) {
        cached = undefined;
        return null;
      }

      throw error;
    }
  };
};

export const listS3Keys = async (
  bucket: string,
  prefix: string
): Promise<string[]> => {
  const keys: string[] = [];
  let continuationToken: string | undefined;

  do {
    const response = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      })
    );

    for (const object of response.Contents ?? []) {
      if (object.Key) {
        keys.push(object.Key);
      }
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return keys;
};

export const putS3Object = (
  bucket: string,
  key: string,
  body: string,
  contentType = 'application/json'
) =>
  s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

export const deleteS3Objects = async (bucket: string, keys: string[]) => {
  // DeleteObjects accepts at most 1000 keys.
  for (let i = 0; i < keys.length; i += 1000) {
    await s3Client.send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: {
          Objects: keys.slice(i, i + 1000).map((Key) => ({ Key })),
          Quiet: true,
        },
      })
    );
  }
};

export const s3DataSource = (bucket: string): DataSource => ({
  read: (key) => readS3Object(bucket, key),
  list: (prefix) => listS3Keys(bucket, prefix),
});
