import { Result } from '@vocably/model';
import { request as httpRequest } from '@vocably/model-operations';
import { apiOptions } from './config';

export const publicRequest = async (
  url: string,
  init: RequestInit
): Promise<Result<any>> => {
  return httpRequest(apiOptions.publicBaseUrl + url, init);
};
