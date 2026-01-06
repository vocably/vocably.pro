import { AppAuthStorage } from '@vocably/pontis';
import { merge } from 'lodash-es';
import { isFirefox } from './browser';
import { environment } from './environments/environment';
import { extensionId } from './extension';
import { FirefoxAppAuthStorage } from './firefox-auth-storage';

export const autoSignInPath = 'hands-free';

export const autoSignInConfirmationPath = 'signed-in';
export const manualSignInConfirmationPath = 'portal';

if (
  manualSignInConfirmationPath.includes(autoSignInConfirmationPath) ||
  autoSignInConfirmationPath.includes(manualSignInConfirmationPath)
) {
  throw 'manualSignInConfirmationPath must not contain parts of autoSignInPath';
}

const constructRedirectSignInUrl = (): string => {
  const basePath = `${location.protocol}//${location.host}`;
  const currentPath = location.pathname.substring(1);

  if ([autoSignInPath, autoSignInConfirmationPath].includes(currentPath)) {
    return basePath + `/${autoSignInConfirmationPath}`;
  }

  return basePath + `/${manualSignInConfirmationPath}`;
};

// Firefox doesn't support externally_connectable, so we use a content script bridge
const storage = isFirefox
  ? new FirefoxAppAuthStorage()
  : new AppAuthStorage(extensionId);

export const authConfig = {
  storage,
  ...merge(
    {
      oauth: {
        redirectSignIn: constructRedirectSignInUrl(),
        redirectSignOut: `${location.protocol}//${location.host}`,
      },
    },
    environment.auth
  ),
};
