import { ResourcesConfig } from '@aws-amplify/core';
import { Result } from '@vocably/model';
import { Amplify } from 'aws-amplify';
import { getCurrentUser } from 'aws-amplify/auth';

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
 * Whether the visitor is signed in to Vocably.
 *
 * A signed out visitor is a regular `false` answer. Only a missing Cognito
 * configuration or an unexpected Amplify failure comes back as an error.
 */
export const isLoggedIn = async (): Promise<Result<boolean>> => {
  const userPoolId = window['authUserPoolId'];
  const userPoolClientId = window['authUserPoolWebClientId'];

  if (!userPoolId || !userPoolClientId) {
    return {
      success: false,
      errorCode: 'AUTH_UNABLE_TO_GET_USER_SESSION',
      reason: 'The Cognito user pool is not configured on this page.',
    };
  }

  configureAuth(userPoolId, userPoolClientId);

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
