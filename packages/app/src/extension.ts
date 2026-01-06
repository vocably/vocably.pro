import { isChrome, isFirefox, isIOSSafari, isMacSafari } from './browser';
import { environment } from './environments/environment';

export const canExtensionBeInstalled =
  isIOSSafari || isMacSafari || isChrome || isFirefox;

const iosSafariExtensionId =
  localStorage.getItem('ios-extension-id') ?? environment.iosSafariExtensionId;

export const extensionId = isIOSSafari
  ? iosSafariExtensionId
  : isMacSafari
  ? environment.safariExtensionId
  : environment.chromeExtensionId;

export const extensionInstallationUrl = isIOSSafari
  ? 'https://vocably.pro/ios-safari-extension.html'
  : isMacSafari
  ? 'https://apps.apple.com/app/id6464076425'
  : 'https://chrome.google.com/webstore/detail/vocably/baocigmmhhdemijfjnjdidbkfgpgogmb';
