import { environment } from '../../environments/environment';

/**
 * The keys Amplify v6 writes when `signInWithRedirect` hands the browser over
 * to Cognito. See `DefaultOAuthStore` in `@aws-amplify/auth`.
 */
const oAuthStorageKeys = ['inflightOAuth', 'oauthPKCE', 'oauthState'];

/**
 * Works around Amplify v6 leaving the app permanently blank after a refused
 * Google/Apple sign-in.
 *
 * While `inflightOAuth` is set, everything that needs tokens
 * (`fetchAuthSession`, `getCurrentUser`) parks on a shared promise until the
 * redirect completes — see `TokenOrchestrator.waitForInflightOAuth`. When
 * Cognito refuses the sign-in it comes back as `?error=...` with no `code`, and
 * Amplify's `handleFailure` resolves the parked callers *before* it clears
 * `inflightOAuth`. Anything that asks for a token inside that window parks on a
 * promise that nothing will ever resolve again.
 *
 * The `APP_INITIALIZER` that reads the user's interface language does exactly
 * that, so Angular never finishes bootstrapping and `<app-root>` stays empty.
 * Reloading appears to fix it only because the marker is gone by then.
 *
 * A failed redirect carries nothing for Amplify to exchange, so dropping the
 * markers first simply makes it skip the flow. The failure itself is read off
 * the URL by `redirectErrorFromParams`.
 */
export const clearFailedRedirectOAuthState = (): void => {
  const params = new URLSearchParams(window.location.search);

  if (!params.has('error') && !params.has('error_description')) {
    return;
  }

  // Deliberately synchronous: this has to be done before `Amplify.configure`
  // triggers the redirect handler.
  oAuthStorageKeys.forEach((key) => {
    localStorage.removeItem(
      `CognitoIdentityServiceProvider.${environment.auth.userPoolWebClientId}.${key}`
    );
  });
};
