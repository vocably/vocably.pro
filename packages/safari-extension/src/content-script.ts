import { registerContentScript } from '@vocably/extension-content-script';

registerContentScript({
  api: {
    appBaseUrl: process.env.APP_BASE_URL,
  },
  youTube: { ytHosts: ['www.youtube.com'] },
  contentScript: {
    askForRatingEnabled: true,
    displayMobileLookupButton: false,
    allowFirstTranslationCongratulation: true,
    webPaymentLink: process.env.APP_BASE_URL + '/subscribe',
  },
}).then();
