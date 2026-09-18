import { Callback, Context, PreSignUpTriggerEvent } from 'aws-lambda';
import { listUsersByEmail } from './listUsersByEmail';

/**
 * Surfaced to the user by Cognito, prefixed with "PreSignUp failed with error ".
 */
const EMAIL_REQUIRED =
  'An email address is required. Please sign up in the Vocably app.';

const emailTaken = (providers: string) =>
  `An account with this email already exists. Please sign in with ${providers}.`;

/**
 * Cognito's ListUsers filter wraps the value in double quotes and offers no
 * escaping, so anything that could break out of the literal is refused rather
 * than interpolated.
 */
const isFilterSafeEmail = (email: string): boolean =>
  /^[^\s"\\@]+@[^\s"\\@]+\.[^\s"\\@]+$/.test(email);

/**
 * How the user signed up, for the "sign in with X instead" hint.
 */
const describeProviders = (usernames: string[]): string => {
  const hasGoogle = usernames.some((name) => name.startsWith('Google_'));
  const hasApple = usernames.some((name) =>
    name.startsWith('SignInWithApple_')
  );

  if (hasGoogle && hasApple) {
    return 'Google or Apple';
  }

  if (hasGoogle) {
    return 'Google';
  }

  if (hasApple) {
    return 'Apple';
  }

  return 'your email and password';
};

export const authPreSignUp = async (
  event: PreSignUpTriggerEvent,
  _context: Context,
  callback: Callback
): Promise<void> => {
  const { triggerSource, userPoolId, userName } = event;

  // Admin invites go through AdminCreateUser, which is trusted and may
  // legitimately omit attributes.
  if (triggerSource === 'PreSignUp_AdminCreateUser') {
    return callback(null, event);
  }

  try {
    const email = (event.request.userAttributes.email ?? '')
      .trim()
      .toLowerCase();

    if (!email) {
      // Managed login's sign-up form cannot collect an email on this pool:
      // it renders only required attributes, and email is not required
      // (immutable after pool creation). Letting it through would create an
      // account that can never be verified or recovered.
      console.log(
        `Rejecting ${triggerSource} for "${userName}": no email attribute.`
      );
      return callback(new Error(EMAIL_REQUIRED), event);
    }

    if (!isFilterSafeEmail(email)) {
      console.log(
        `Rejecting ${triggerSource} for "${userName}": malformed email.`
      );
      return callback(new Error(EMAIL_REQUIRED), event);
    }

    const existingUsers = await listUsersByEmail({ userPoolId, email });

    const conflicting = existingUsers
      .map((user) => user.Username)
      .filter((name): name is string => !!name && name !== userName);

    if (conflicting.length > 0) {
      console.log(
        `Rejecting ${triggerSource} for "${userName}": email already used by ${conflicting.join(
          ', '
        )}.`
      );
      return callback(
        new Error(emailTaken(describeProviders(conflicting))),
        event
      );
    }

    // Email verification is deliberately left on: the confirmation code is the
    // only proof the address belongs to whoever signed up, and without a
    // verified email there is no password recovery.
    return callback(null, event);
  } catch (error) {
    console.error('An error in pre sign up lambda occurred', error);
    return callback(error, event);
  }
};
