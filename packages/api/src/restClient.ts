import { Result } from '@vocably/model';
import { request as httpRequest } from '@vocably/model-operations';
import { merge } from 'lodash-es';
import { apiOptions } from './config';

export const request = async (
  url: string,
  init: RequestInit
): Promise<Result<any>> => {
  const token = await apiOptions.getJwtToken();
  let headers = {
    Authorization: `Bearer ${token}`,
  };
  let result = await httpRequest(
    apiOptions.baseUrl + url,
    merge(init, {
      headers,
    })
  );

  if (!result.success && result.errorCode === 'API_REQUEST_UNAUTHORIZED') {
    console.warn(`API_REQUEST_UNAUTHORIZED, retrying in 2 seconds...`, {
      tokenLength: token.length,
      result,
    });
    await new Promise((resolve) => setTimeout(resolve, 2000));
    headers = {
      Authorization: `Bearer ${await apiOptions.getJwtToken()}`,
    };
    result = await httpRequest(
      apiOptions.baseUrl + url,
      merge(init, {
        headers,
      })
    );
    console.debug('retry result', result);
  }

  if (!result.success && apiOptions.onError) {
    apiOptions.onError(result);
  }

  return result;
};
