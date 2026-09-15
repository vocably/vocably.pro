/**
 * Email + password helpers shared by the web app and the mobile app.
 *
 * The username of an email/password account *is* the normalized email: the
 * user pool has no username_attributes or alias_attributes, so uniqueness of
 * the address relies on every client normalizing it the same way.
 */
export const normalizeEmail = (email: string): string =>
  email.trim().toLowerCase();

/**
 * Same shape the pre sign-up trigger accepts, so the form never submits an
 * address the trigger would reject.
 */
export const isValidEmail = (email: string): boolean =>
  /^[^\s"\\@]+@[^\s"\\@]+\.[^\s"\\@]+$/.test(normalizeEmail(email));

export const PASSWORD_MIN_LENGTH = 8;

/**
 * Cognito's list of special characters. The space counts as one too.
 */
const PASSWORD_SYMBOLS = '^$*.[]{}()?"!@#%&/\\,><\':;|_~`=+- ';

export type PasswordCheck = {
  minLength: boolean;
  lowercase: boolean;
  uppercase: boolean;
  digit: boolean;
  symbol: boolean;
};

/**
 * Mirrors the default Cognito password policy of the user pool.
 */
export const checkPassword = (password: string): PasswordCheck => ({
  minLength: password.length >= PASSWORD_MIN_LENGTH,
  lowercase: /[a-z]/.test(password),
  uppercase: /[A-Z]/.test(password),
  digit: /[0-9]/.test(password),
  symbol: [...password].some((char) => PASSWORD_SYMBOLS.includes(char)),
});

export const isPasswordValid = (password: string): boolean =>
  Object.values(checkPassword(password)).every(Boolean);

export type AuthErrorCode =
  | 'invalidCredentials'
  | 'userNotConfirmed'
  | 'usernameExists'
  | 'emailTakenGoogle'
  | 'emailTakenApple'
  | 'emailTakenGoogleOrApple'
  | 'emailTakenPassword'
  | 'invalidEmail'
  | 'codeMismatch'
  | 'codeExpired'
  | 'tooManyAttempts'
  | 'invalidPassword'
  | 'network'
  | 'cancelled'
  | 'unknown';

const errorCodesByName: Record<string, AuthErrorCode> = {
  NotAuthorizedException: 'invalidCredentials',
  UserNotFoundException: 'invalidCredentials',
  UserNotConfirmedException: 'userNotConfirmed',
  UsernameExistsException: 'usernameExists',
  AliasExistsException: 'usernameExists',
  CodeMismatchException: 'codeMismatch',
  ExpiredCodeException: 'codeExpired',
  LimitExceededException: 'tooManyAttempts',
  TooManyRequestsException: 'tooManyAttempts',
  TooManyFailedAttemptsException: 'tooManyAttempts',
  InvalidPasswordException: 'invalidPassword',
  NetworkError: 'network',
  UserCancelledException: 'cancelled',
};

const decode = (message: string): string => {
  try {
    return decodeURIComponent(message.replace(/\+/g, ' '));
  } catch {
    return message;
  }
};

/**
 * The pre sign-up trigger's messages (see packages/auth-lambdas) arrive as
 * text only: in a UserLambdaValidationException from SignUp, and as the
 * error_description of a failed Google/Apple redirect.
 */
const errorCodeFromMessage = (message: string): AuthErrorCode | undefined => {
  const text = decode(message);

  if (text.includes('An account with this email already exists')) {
    if (text.includes('Google or Apple')) {
      return 'emailTakenGoogleOrApple';
    }

    if (text.includes('Google')) {
      return 'emailTakenGoogle';
    }

    if (text.includes('Apple')) {
      return 'emailTakenApple';
    }

    return 'emailTakenPassword';
  }

  if (text.includes('An email address is required')) {
    return 'invalidEmail';
  }

  // Amplify's own wording for a Google/Apple window the user closed.
  if (
    text.includes('User cancelled OAuth flow') ||
    text.includes('has been canceled') ||
    // What the React Native in-app browser reports when it is closed.
    text.trim() === 'canceled'
  ) {
    return 'cancelled';
  }

  if (text.includes('Password attempts exceeded')) {
    return 'tooManyAttempts';
  }

  return undefined;
};

/**
 * Classifies whatever Amplify throws (or dispatches through Hub) so that the
 * clients can show a translated message. The Cognito text itself is English
 * only and is never meant to be shown as is.
 */
export const getAuthErrorCode = (error: unknown): AuthErrorCode => {
  if (typeof error === 'string') {
    return errorCodeFromMessage(error) ?? 'unknown';
  }

  if (typeof error !== 'object' || error === null) {
    return 'unknown';
  }

  const { name, message } = error as { name?: unknown; message?: unknown };

  const fromMessage =
    typeof message === 'string' ? errorCodeFromMessage(message) : undefined;

  if (fromMessage) {
    return fromMessage;
  }

  if (typeof name === 'string' && errorCodesByName[name]) {
    return errorCodesByName[name];
  }

  return 'unknown';
};
