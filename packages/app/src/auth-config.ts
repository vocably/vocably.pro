import { AppAuthStorage } from '@vocably/pontis';
import { merge } from 'lodash-es';
import { environment } from './environments/environment';
import { extensionId } from './extension';
import { isFirefox } from './firefox';
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

export const authConfig = {
  storage: isFirefox
    ? new FirefoxAppAuthStorage()
    : new AppAuthStorage(extensionId),
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
