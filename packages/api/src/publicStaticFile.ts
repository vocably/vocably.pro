import { Result } from '@vocably/model';
import { request as httpRequest } from '@vocably/model-operations';
import { apiOptions } from './config';

export const publicStaticFile = async (
  file: string,
  abortController?: AbortController
): Promise<Result<any>> => {
  try {
    return await httpRequest(
      `${apiOptions.baseUrl}/public-static-files/${file}`,
      {
        method: 'GET',
        signal: abortController?.signal,
      }
    );
  } catch (e) {
    return {
      success: false,
      errorCode: 'API_PUBLIC_STATIC_FILE_REQUEST_FAILED',
      reason: 'The analyze request has failed.',
      extra: e,
    };
  }
};
