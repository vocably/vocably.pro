/**
 * Firefox Extension Content Script
 * 
 * Polyfill for Stencil.js runtime bug:
 * In Firefox extension content scripts, document.adoptedStyleSheets may not exist
 * or Object.getOwnPropertyDescriptor may return undefined for it.
 * This causes Stencil.js to crash before our code can run.
 */

// Ensure adoptedStyleSheets exists to prevent Stencil.js crash
// @ts-ignore - TypeScript doesn't know about adoptedStyleSheets on Document
if (typeof document !== 'undefined' && !(document as any).adoptedStyleSheets) {
  Object.defineProperty(document, 'adoptedStyleSheets', {
    value: [],
    writable: true,
    configurable: true
  });
}

// Now safe to import Stencil-based components
import { registerContentScript } from '@vocably/extension-content-script';

console.log('[Vocably Content] Script starting...');

if (!document.body.classList.contains('vocably-extension-disabled')) {
  console.log('[Vocably Content] Registering content script...');
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
  }).then(() => {
    console.log('[Vocably Content] Content script registered successfully!');
  }).catch((err: Error) => {
    console.error('[Vocably Content] Failed to register content script:', err.message);
  });
} else {
  console.log('[Vocably Content] Content script disabled by page');
}
