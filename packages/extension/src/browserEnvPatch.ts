import { browserEnv } from './browserEnv';

/**
 * Firefox compatibility patch for chrome.storage
 * 
 * The @vocably/pontis package uses chrome.storage directly,
 * but in Firefox we need to ensure it uses browser.storage.
 * This patch ensures chrome.storage[type] works correctly in Firefox.
 */
if (typeof browser !== 'undefined' && typeof chrome !== 'undefined') {
  // Firefox has both 'browser' and 'chrome' namespaces
  // Ensure chrome.storage points to browser.storage
  if (!chrome.storage || !chrome.storage.local) {
    // @ts-ignore
    chrome.storage = browser.storage;
  }
}

export { browserEnv };
