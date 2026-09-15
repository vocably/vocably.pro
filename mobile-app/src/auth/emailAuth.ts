import { normalizeEmail } from '@vocably/sulna';
import {
  autoSignIn,
  confirmResetPassword,
  confirmSignUp,
  resendSignUpCode,
  resetPassword,
  signIn,
  signUp,
} from 'aws-amplify/auth';
import { i18n } from '../i18n';

/**
 * What the screen has to do next. `done` means Amplify has signed the user in
 * and dispatched `signedIn`, which AuthContainer picks up.
 */
export type EmailAuthStep = 'done' | 'confirmSignUp' | 'signIn';

/**
 * Kept in memory only, so that confirming the email right after signing up
 * (or after signing in to an unconfirmed account) does not ask for the
 * password again. Never put it in navigation params.
 */
let pendingCredentials: { username: string; password: string } | null = null;

// Picked up by the custom message trigger to localize the email.
const clientMetadata = () => ({ locale: i18n.language });

export const signInWithEmail = async (
  email: string,
  password: string
): Promise<EmailAuthStep> => {
  const username = normalizeEmail(email);
  const { nextStep } = await signIn({ username, password });

  if (nextStep.signInStep === 'CONFIRM_SIGN_UP') {
    // Cognito does not send a code on its own at this point.
    pendingCredentials = { username, password };
    await resendSignUpCode({
      username,
      options: { clientMetadata: clientMetadata() },
    });
    return 'confirmSignUp';
  }

  if (nextStep.signInStep !== 'DONE') {
    throw new Error(`Unsupported sign-in step ${nextStep.signInStep}`);
  }

  pendingCredentials = null;
  return 'done';
};

export const signUpWithEmail = async (
  email: string,
  password: string
): Promise<EmailAuthStep> => {
  const username = normalizeEmail(email);
  const { locale } = clientMetadata();

  const { nextStep } = await signUp({
    username,
    password,
    options: {
      userAttributes: { email: username, locale },
      clientMetadata: { locale },
      autoSignIn: true,
    },
  });

  pendingCredentials = { username, password };

  if (nextStep.signUpStep === 'COMPLETE_AUTO_SIGN_IN') {
    await autoSignIn();
    pendingCredentials = null;
    return 'done';
  }

  return 'confirmSignUp';
};

export const confirmEmail = async (
  email: string,
  code: string
): Promise<EmailAuthStep> => {
  const username = normalizeEmail(email);

  const { nextStep } = await confirmSignUp({
    username,
    confirmationCode: code.trim(),
  });

  const pending =
    pendingCredentials?.username === username ? pendingCredentials : null;

  if (nextStep.signUpStep === 'COMPLETE_AUTO_SIGN_IN') {
    try {
      await autoSignIn();
      pendingCredentials = null;
      return 'done';
    } catch (error) {
      if (!pending) {
        throw error;
      }
    }
  }

  if (pending) {
    return signInWithEmail(username, pending.password);
  }

  // The app was restarted between signing up and confirming.
  return 'signIn';
};

export const resendEmailConfirmationCode = async (email: string) => {
  await resendSignUpCode({
    username: normalizeEmail(email),
    options: { clientMetadata: clientMetadata() },
  });
};

export const requestPasswordReset = async (email: string) => {
  await resetPassword({
    username: normalizeEmail(email),
    options: { clientMetadata: clientMetadata() },
  });
};

export const confirmPasswordReset = async (
  email: string,
  code: string,
  newPassword: string
): Promise<EmailAuthStep> => {
  const username = normalizeEmail(email);

  await confirmResetPassword({
    username,
    confirmationCode: code.trim(),
    newPassword,
  });

  return signInWithEmail(username, newPassword);
};
