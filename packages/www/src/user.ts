import { ResourcesConfig } from '@aws-amplify/core';
import { configureApi } from '@vocably/api';
import { Result } from '@vocably/model';
import { Amplify } from 'aws-amplify';
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';

/**
 * Mirrors `packages/app/src/auth-config.ts`, without the `@vocably/pontis`
 * storage: the website only reads the session, it is not a bridge between the
 * extension and Cognito. The app is served from the same origin as the website
 * (`vocably.pro/app` and `vocably.pro`), and `AppAuthStorage` keeps its items
 * in `localStorage`, so Amplify's default storage already sees the tokens the
 * app has written.
 *
 * The OAuth part of the app config is left out as well: signing in happens in
 * the app, the website never starts a redirect flow.
 */
const authConfig = (
  userPoolId: string,
  userPoolClientId: string
): ResourcesConfig['Auth'] => ({
  Cognito: {
    userPoolId,
    userPoolClientId,
  },
});

let isConfigured = false;

const configureAuth = (userPoolId: string, userPoolClientId: string) => {
  if (isConfigured) {
    return;
  }

  Amplify.configure({ Auth: authConfig(userPoolId, userPoolClientId) });
  isConfigured = true;
};

/**
 * The Cognito pool is injected per page by `layout.handlebars`, so every entry
 * point that touches the session has to check it is actually there.
 */
const ensureAuthConfigured = (): boolean => {
  const userPoolId = window['authUserPoolId'];
  const userPoolClientId = window['authUserPoolWebClientId'];

  if (!userPoolId || !userPoolClientId) {
    return false;
  }

  configureAuth(userPoolId, userPoolClientId);

  return true;
};

/**
 * Whether the visitor is signed in to Vocably.
 *
 * A signed out visitor is a regular `false` answer. Only a missing Cognito
 * configuration or an unexpected Amplify failure comes back as an error.
 */
export const isLoggedIn = async (): Promise<Result<boolean>> => {
  if (!ensureAuthConfigured()) {
    return {
      success: false,
      errorCode: 'AUTH_UNABLE_TO_GET_USER_SESSION',
      reason: 'The Cognito user pool is not configured on this page.',
    };
  }

  try {
    await getCurrentUser();

    return {
      success: true,
      value: true,
    };
  } catch (e) {
    // Amplify reports a missing session by throwing, which is not an error
    // here: it is the answer.
    if (e instanceof Error && e.name === 'UserUnAuthenticatedException') {
      return {
        success: true,
        value: false,
      };
    }

    return {
      success: false,
      errorCode: 'AUTH_UNABLE_TO_GET_USER_SESSION',
      reason: 'Unable to find out whether the user is signed in.',
      extra: e,
    };
  }
};

/**
 * The following three mirror `packages/extension-service-worker/src/session.ts`.
 * Amplify v6 resolves `fetchAuthSession()` with an empty session when the user
 * is signed out rather than rejecting, so the tokens are checked explicitly.
 */
export const getIdToken = async (): Promise<string> => {
  if (!ensureAuthConfigured()) {
    return '';
  }

  const session = await fetchAuthSession().catch(() => null);

  return session?.tokens?.idToken?.toString() ?? '';
};

export const isSignedIn = async (): Promise<boolean> => {
  if (!ensureAuthConfigured()) {
    return false;
  }

  const session = await fetchAuthSession().catch(() => null);

  return !!session?.tokens?.accessToken;
};

export const isInPaidGroup = async (): Promise<boolean> => {
  if (!ensureAuthConfigured()) {
    return false;
  }

  const session = await fetchAuthSession().catch(() => null);
  const groups = session?.tokens?.accessToken?.payload['cognito:groups'];

  return Array.isArray(groups) && groups.includes('paid');
};

let isApiConfigured = false;

/**
 * Points `@vocably/api` at the same endpoints the rest of the site uses, with
 * the visitor's Cognito ID token, so the authenticated deck endpoints can be
 * called from here.
 */
export const configureDeckApi = () => {
  if (isApiConfigured) {
    return;
  }

  configureApi({
    baseUrl: window['apiBaseUrl'],
    publicBaseUrl: window['publicApiBaseUrl'],
    // Both are declared by `ApiOptions` but never read by `@vocably/api`.
    region: '',
    cardsBucket: '',
    getJwtToken: getIdToken,
  });

  isApiConfigured = true;
};

/**
 * Signing in happens in the app, in a separate tab. There is no message back to
 * this page, so the session is re-checked whenever the visitor returns to it.
 *
 * Only useful while the visitor is signed out: it fires on the first focus that
 * finds a session, and never again.
 */
export const onSignedIn = (callback: () => void): void => {
  let alreadySignedIn = false;

  window.addEventListener('focus', async () => {
    if (alreadySignedIn) {
      return;
    }

    const result = await isLoggedIn();

    if (result.success && result.value) {
      alreadySignedIn = true;
      callback();
    }
  });
};
