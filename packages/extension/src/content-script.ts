import { registerContentScript } from '@vocably/extension-content-script';

if (!document.body.classList.contains('vocably-extension-disabled')) {
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
}
