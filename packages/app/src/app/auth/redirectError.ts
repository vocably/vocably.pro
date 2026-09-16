import { ParamMap } from '@angular/router';
import { AuthErrorCode, getAuthErrorCode } from '@vocably/sulna';
import { Hub } from 'aws-amplify/utils';
import { BehaviorSubject } from 'rxjs';

/**
 * The last failed Google/Apple sign-in, e.g. the pre sign-up trigger refusing
 * an email that already belongs to an email + password account.
 */
export const redirectError$ = new BehaviorSubject<AuthErrorCode | null>(null);

/**
 * Amplify finishes the redirect as soon as it is configured, which can be
 * before any Angular component exists. Call this ahead of Amplify.configure so
 * the failure event is not lost.
 */
export const listenForRedirectErrors = () =>
  Hub.listen('auth', ({ payload }) => {
    if (payload.event !== 'signInWithRedirect_failure') {
      return;
    }

    const code = getAuthErrorCode(payload.data?.error);

    if (code !== 'cancelled') {
      redirectError$.next(code);
    }
  });

/**
 * Cognito can also refuse the sign-in through the redirect itself, as
 * `?error=invalid_request&error_description=...` on the confirmation page.
 * Nothing is left for Amplify to exchange in that case, so no Hub event is
 * dispatched and the page has to read the failure off the URL.
 */
export const redirectErrorFromParams = (
  params: ParamMap
): AuthErrorCode | null => {
  const error = params.get('error');
  const description = params.get('error_description');

  if (!error && !description) {
    return null;
  }

  if (description) {
    // The pre sign-up trigger's message travels in `error_description`.
    const code = getAuthErrorCode(description);

    if (code !== 'unknown') {
      return code;
    }
  }

  // How a declined Google or Apple consent screen comes back.
  return error === 'access_denied' ? 'cancelled' : 'unknown';
};

/**
 * Where such a failure leaves the user. The `emailTaken*` codes mean the
 * account exists and only the provider was wrong, whereas a sign-up the
 * trigger rejected has no account to sign in to yet.
 */
export const destinationForRedirectError = (code: AuthErrorCode): string =>
  code === 'invalidEmail' ? '/sign-up' : '/sign-in';
