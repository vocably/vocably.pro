import {
  getIdToken,
  registerServiceWorker,
} from '@vocably/extension-service-worker';
import '@vocably/extension-stay-alive';
import { registerExtensionStorage } from '@vocably/pontis';

const storage = registerExtensionStorage('sync');

registerServiceWorker({
  auth: {
    userPoolId: process.env.AUTH_USER_POOL_ID,
    userPoolWebClientId: process.env.AUTH_USER_POOL_WEB_CLIENT_ID,
    storage,
  },
  api: {
    publicBaseUrl: process.env.PUBLIC_API_BASE_URL,
    baseUrl: process.env.API_BASE_URL,
    region: process.env.API_REGION,
    cardsBucket: process.env.API_CARDS_BUCKET,
    getJwtToken: getIdToken,
  },
  facility: 'ios-safari',
});
