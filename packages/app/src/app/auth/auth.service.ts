import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { mapUserAttributes, UserData } from '@vocably/model';
import { normalizeEmail } from '@vocably/sulna';
import {
  AuthUser,
  autoSignIn,
  confirmResetPassword,
  confirmSignUp,
  fetchAuthSession,
  fetchUserAttributes,
  getCurrentUser,
  resendSignUpCode,
  resetPassword,
  signIn,
  signInWithRedirect,
  signOut,
  signUp,
} from 'aws-amplify/auth';
import { map, ReplaySubject, retry, Subject, switchMap, take, tap } from 'rxjs';
import { signInConfirmationPath } from '../../auth-config';

export type SocialProvider = 'Google' | 'Apple';

/**
 * What the screen has to do after an email + password call that did not throw.
 * `done` means the user is signed in and has already been navigated away.
 */
export type EmailAuthStep = 'done' | 'confirmSignUp' | 'signIn';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isLoggedIn$ = new ReplaySubject<boolean>(1);
  currentUser$ = new ReplaySubject<AuthUser>(1);
  userData$ = new ReplaySubject<UserData>(1);

  fetchUserData$ = this.currentUser$.pipe(
    switchMap(async (user) => {
      return {
        username: user.username,
        attributes: await fetchUserAttributes(),
      };
    }),
    map(mapUserAttributes)
  );

  public waitForSubscriptionHook$ = this.fetchUserData$.pipe(
    tap((userData) => {
      this.userData$.next(userData);
    }),
    switchMap(() => {
      return this.refreshToken();
    }),
    take(1),
    retry({
      delay: 1000,
      count: 20,
    })
  );

  private refreshUserData$ = new Subject();

  /**
   * Kept in memory only, so that confirming the email right after signing up
   * (or after signing in to an unconfirmed account) does not ask for the
   * password again.
   */
  private pendingCredentials: { username: string; password: string } | null =
    null;

  constructor(
    private router: Router,
    private transloco: TranslocoService
  ) {
    this.refreshUser();

    const refreshUserData$ = this.fetchUserData$.pipe(
      tap((userData) => {
        this.userData$.next(userData);
      })
    );

    this.refreshUserData$.pipe(switchMap(() => refreshUserData$)).subscribe();
    refreshUserData$.subscribe();
  }

  private get clientMetadata() {
    // Picked up by the custom message trigger to localize the email.
    return { locale: this.transloco.getActiveLang() };
  }

  private async refreshUser(): Promise<void> {
    const user = await getCurrentUser().catch(() => false as const);

    this.isLoggedIn$.next(user !== false);

    if (user !== false) {
      this.currentUser$.next(user);
    }
  }

  private async finishSignIn(): Promise<EmailAuthStep> {
    this.pendingCredentials = null;
    await this.refreshUser();
    await this.router.navigate([`/${signInConfirmationPath}`], {
      replaceUrl: true,
    });
    return 'done';
  }

  async signInWithProvider(provider: SocialProvider) {
    return signInWithRedirect({ provider });
  }

  async signInWithEmail(
    email: string,
    password: string
  ): Promise<EmailAuthStep> {
    const username = normalizeEmail(email);
    const { nextStep } = await signIn({ username, password });

    if (nextStep.signInStep === 'CONFIRM_SIGN_UP') {
      // Cognito does not send a code on its own at this point.
      this.pendingCredentials = { username, password };
      await resendSignUpCode({
        username,
        options: { clientMetadata: this.clientMetadata },
      });
      return 'confirmSignUp';
    }

    if (nextStep.signInStep !== 'DONE') {
      throw new Error(`Unsupported sign-in step ${nextStep.signInStep}`);
    }

    return this.finishSignIn();
  }

  async signUpWithEmail(
    email: string,
    password: string
  ): Promise<EmailAuthStep> {
    const username = normalizeEmail(email);
    const { locale } = this.clientMetadata;

    const { nextStep } = await signUp({
      username,
      password,
      options: {
        userAttributes: { email: username, locale },
        clientMetadata: { locale },
        autoSignIn: true,
      },
    });

    this.pendingCredentials = { username, password };

    if (nextStep.signUpStep === 'COMPLETE_AUTO_SIGN_IN') {
      await autoSignIn();
      return this.finishSignIn();
    }

    return 'confirmSignUp';
  }

  async confirmEmail(email: string, code: string): Promise<EmailAuthStep> {
    const username = normalizeEmail(email);

    const { nextStep } = await confirmSignUp({
      username,
      confirmationCode: code.trim(),
    });

    const pending =
      this.pendingCredentials?.username === username
        ? this.pendingCredentials
        : null;

    if (nextStep.signUpStep === 'COMPLETE_AUTO_SIGN_IN') {
      try {
        await autoSignIn();
        return this.finishSignIn();
      } catch (error) {
        if (!pending) {
          throw error;
        }
      }
    }

    if (pending) {
      return this.signInWithEmail(username, pending.password);
    }

    // The page was reloaded between signing up and confirming.
    return 'signIn';
  }

  async resendSignUpCode(email: string): Promise<void> {
    await resendSignUpCode({
      username: normalizeEmail(email),
      options: { clientMetadata: this.clientMetadata },
    });
  }

  async requestPasswordReset(email: string): Promise<void> {
    await resetPassword({
      username: normalizeEmail(email),
      options: { clientMetadata: this.clientMetadata },
    });
  }

  async confirmPasswordReset(
    email: string,
    code: string,
    newPassword: string
  ): Promise<EmailAuthStep> {
    const username = normalizeEmail(email);

    await confirmResetPassword({
      username,
      confirmationCode: code.trim(),
      newPassword,
    });

    return this.signInWithEmail(username, newPassword);
  }

  async signOut() {
    localStorage.removeItem('onboardedLanguages');
    return signOut();
  }

  async refreshToken(): Promise<void> {
    await fetchAuthSession({ forceRefresh: true });
  }

  async isPaidGroup(): Promise<boolean> {
    const session = await fetchAuthSession().catch(() => null);
    const groups = session?.tokens?.accessToken?.payload['cognito:groups'];

    return Array.isArray(groups) && groups.includes('paid');
  }
}
