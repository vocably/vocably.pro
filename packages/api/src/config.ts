import { ResultError } from '@vocably/model';

type ApiOptions = {
  publicBaseUrl: string;
  baseUrl: string;
  region: string;
  cardsBucket: string;
  getJwtToken: () => Promise<string>;
  onError?: (error: ResultError) => void;
};

export let apiOptions: ApiOptions = {
  publicBaseUrl: '',
  baseUrl: '',
  region: '',
  cardsBucket: '',
  getJwtToken: () => Promise.resolve(''),
};

export const configureApi = (options: ApiOptions) => {
  apiOptions = options;
};
