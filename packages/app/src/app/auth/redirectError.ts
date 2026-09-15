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
