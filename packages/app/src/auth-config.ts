import { ResourcesConfig } from '@aws-amplify/core';
import { AppAuthStorage } from '@vocably/pontis';
import { appBaseUrl } from './app-base-url';
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
  const currentPath = location.href
    .replace(/[?#].*$/, '')
    .substring(appBaseUrl.length + 1);

  if ([autoSignInPath, autoSignInConfirmationPath].includes(currentPath)) {
    return appBaseUrl + `/${autoSignInConfirmationPath}`;
  }

  return appBaseUrl + `/${manualSignInConfirmationPath}`;
};

const redirectSignInUrl = constructRedirectSignInUrl();

/**
 * The route an email + password sign-in lands on. It matches the Google/Apple
 * redirect target, so both kinds of sign-in finish on the same page: the
 * hands-free flow started by the extension still ends on `signed-in`.
 */
export const signInConfirmationPath = redirectSignInUrl.substring(
  appBaseUrl.length + 1
);

/**
 * The storage backing the Cognito tokens. Shared with the browser extension so
 * that signing in on either side signs in on both.
 *
 * Amplify v6 takes it through `cognitoUserPoolsTokenProvider` rather than
 * through the config object, so it is exported separately.
 */
export const authStorage = isFirefox
  ? new FirefoxAppAuthStorage()
  : new AppAuthStorage(extensionId);

/**
 * `environment.auth` keeps the shape Terraform generates (see
 * `platform/environments.tf`), so it is mapped onto Amplify v6's
 * `ResourcesConfig` here rather than reshaped at the source.
 */
export const authConfig: ResourcesConfig['Auth'] = {
  Cognito: {
    userPoolId: environment.auth.userPoolId,
    userPoolClientId: environment.auth.userPoolWebClientId,
    loginWith: {
      oauth: {
        domain: environment.auth.oauth.domain,
        scopes: environment.auth.oauth.scope,
        redirectSignIn: [redirectSignInUrl],
        redirectSignOut: [appBaseUrl],
        responseType: 'code',
      },
    },
  },
};
