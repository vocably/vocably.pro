import { Result } from '@vocably/model';
import { request as httpRequest } from '@vocably/model-operations';
import { merge } from 'lodash-es';
import { apiOptions } from './config';

export const request = async (
  url: string,
  init: RequestInit
): Promise<Result<any>> => {
  const headers = {
    Authorization: `Bearer ${await apiOptions.getJwtToken()}`,
  };
  const result = await httpRequest(
    apiOptions.baseUrl + url,
    merge(init, {
      headers,
    })
  );

  if (!result.success && apiOptions.onError) {
    apiOptions.onError(result);
  }

  return result;
};
