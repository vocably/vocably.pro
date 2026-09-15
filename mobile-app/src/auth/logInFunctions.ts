import { signInWithRedirect } from 'aws-amplify/auth';
import { forcefulSignOut } from '../forcefulSignOut';

export type SocialProvider = 'Google' | 'Apple';

/**
 * Goes straight to Google or Apple: passing the provider makes Cognito skip
 * its own login page.
 *
 * Throws what the flow failed with (including a closed browser, which
 * getAuthErrorCode reports as `cancelled`).
 */
export const signInWithProvider = async (provider: SocialProvider) => {
  try {
    await signInWithRedirect({
      provider,
      options: {
        // Otherwise Cognito silently reuses the previous session and the
        // user cannot pick another account.
        prompt: 'LOGIN',
      },
    });
  } catch (e) {
    // @ts-ignore
    if (e.toString().includes('UserAlreadyAuthenticatedException')) {
      forcefulSignOut();
      return;
    }

    throw e;
  }
};
