import { Auth } from '@aws-amplify/auth';
import { registerServiceWorker } from '@vocably/extension-service-worker';
import { registerExtensionStorage } from '@vocably/pontis';
import { browserEnv } from './browserEnv';
const storage = registerExtensionStorage('sync');

registerServiceWorker({
  auth: {
    region: process.env.AUTH_REGION,
    userPoolId: process.env.AUTH_USER_POOL_ID,
    userPoolWebClientId: process.env.AUTH_USER_POOL_WEB_CLIENT_ID,
    storage,
  },
  api: {
    publicBaseUrl: process.env.PUBLIC_API_BASE_URL,
    baseUrl: process.env.API_BASE_URL,
    region: process.env.API_REGION,
    cardsBucket: process.env.API_CARDS_BUCKET,
    getJwtToken: () => {
      return Auth.currentSession().then((session) =>
        session.getIdToken().getJwtToken()
      );
    },
  },
  facility: 'chrome-or-safari',
});

browserEnv.contextMenus.create({
  id: 'context-menu-item',
  title: 'Translate with Vocably',
  contexts: ['selection'],
});

browserEnv.contextMenus.onClicked.addListener((info, tab) => {
  browserEnv.tabs.sendMessage(tab.id, {
    action: 'contextMenuTranslateClicked',
  });
});

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    await chrome.tabs.create({
      url: `${process.env.APP_BASE_URL}/page/welcome`,
    });
  }
});

chrome.runtime.setUninstallURL('https://app.vocably.pro/page/uninstall');

// @ts-ignore
window.clearStorage = () => {
  chrome.storage.sync.clear();
};
