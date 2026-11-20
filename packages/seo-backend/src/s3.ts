import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';

const s3Client = new S3Client({ region: process.env.AWS_REGION });

const isMissingKey = (error: any): boolean =>
  error?.name === 'NoSuchKey' ||
  error?.Code === 'NoSuchKey' ||
  error?.$metadata?.httpStatusCode === 404;

/** Resolves to null when the object doesn't exist. */
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
 * Keeps a parsed S3 object in memory between invocations and re-downloads it
 * only when its ETag changes, so a warm container never serves a stale
 * template after a deploy.
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
