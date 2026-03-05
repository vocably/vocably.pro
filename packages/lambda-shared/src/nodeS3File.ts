import {
  DeleteObjectCommand,
  GetObjectCommand,
  GetObjectCommandOutput,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { Result } from '@vocably/model';
import { Readable } from 'node:stream';

const s3Client = new S3Client({ region: process.env.AWS_REGION });

export const nodeFetchS3File = async (
  bucket: string,
  file: string
): Promise<Result<string | null>> => {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: file,
  });
  let response: GetObjectCommandOutput;

  try {
    response = await s3Client.send(command);
  } catch (e: any) {
    if (e.Code === 'NoSuchKey') {
      return {
        success: true,
        value: null,
      };
    }

    return {
      success: false,
      errorCode: 'NODE_S3_FILE_FETCH_ERROR',
      reason: `Unable to fetch file s3://${bucket}/${file}`,
      extra: e,
    };
  }

  if (!response.Body) {
    return {
      success: true,
      value: null,
    };
  }

  const stream = response.Body as Readable;
  const chunks: Uint8Array[] = [];

  for await (const chunk of stream) {
    chunks.push(chunk);
  }

  return {
    success: true,
    value: Buffer.concat(chunks).toString('utf-8'),
  };
};

export const nodePutS3File = async (
  bucket: string,
  file: string,
  body: string,
  input?: Partial<PutObjectCommandInput>
): Promise<Result<null>> => {
  if (file.includes('//') || file.includes('/.')) {
    return {
      success: false,
      errorCode: 'NODE_S3_FILE_INVALID_NAME',
      reason: `File name ${file} contains double slash`,
    };
  }

  if (
    file
      .split('/')
      .some(
        (part) => part.includes('..') || part.length === 0 || part.length > 200
      )
  ) {
    return {
      success: false,
      errorCode: 'NODE_S3_FILE_INVALID_NAME',
      reason: `File name ${file} contains invalid part`,
    };
  }

  try {
    const command = new PutObjectCommand({
      ...input,
      Bucket: bucket,
      Key: file,
      Body: body,
    });
    await s3Client.send(command);
    return {
      success: true,
      value: null,
    };
  } catch (error) {
    return {
      success: false,
      errorCode: 'NODE_S3_FILE_PUT_ERROR',
      reason: `Unable to put file s3://${bucket}/${file}`,
      extra: error,
    };
  }
};

export const nodeDeleteS3File = async (
  bucket: string,
  file: string
): Promise<Result<null>> => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: file,
    });
    await s3Client.send(command);
    return {
      success: true,
      value: null,
    };
  } catch (error) {
    return {
      success: false,
      errorCode: 'NODE_S3_FILE_DELETE_ERROR',
      reason: `Unable to put file s3://${bucket}/${file}`,
      extra: error,
    };
  }
};
