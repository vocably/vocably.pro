import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { Result } from '@vocably/model';

const s3Client = new S3Client({ region: process.env.AWS_REGION });

export const nodeS3Scan = async (
  bucket: string,
  prefix: string
): Promise<Result<string[]>> => {
  const keys: string[] = [];
  let continuationToken: string | undefined;

  try {
    do {
      const command = new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      });
      const response = await s3Client.send(command);
      for (const object of response.Contents ?? []) {
        if (object.Key) {
          keys.push(object.Key);
        }
      }
      continuationToken = response.NextContinuationToken;
    } while (continuationToken);
  } catch (error) {
    return {
      success: false,
      errorCode: 'NODE_S3_SCAN_ERROR',
      reason: `Unable to scan s3://${bucket}/${prefix}`,
      extra: error,
    };
  }

  return {
    success: true,
    value: keys,
  };
};
