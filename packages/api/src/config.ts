type ApiOptions = {
  publicBaseUrl: string;
  baseUrl: string;
  region: string;
  cardsBucket: string;
  getJwtToken: () => Promise<string>;
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
