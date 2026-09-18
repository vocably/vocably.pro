/**
 * The baseline translation. Every other locale is typed against this, so a
 * missing or misspelled key is a build error.
 *
 * There is one person behind Vocably, so the copy speaks in the first person
 * singular and never as "we" - the same rule the app translations follow.
 */
export const en = {
  verifyEmail: {
    subject: 'Confirm your email address',
    heading: 'Confirm your email address',
    intro:
      'Enter this code in Vocably to finish creating your account. It expires in 24 hours.',
    codeLabel: 'Confirmation code',
    footer:
      "If you didn't try to create a Vocably account, you can safely ignore this email.",
  },
  resetPassword: {
    subject: 'Reset your password',
    heading: 'Reset your password',
    intro:
      'Enter this code in Vocably to choose a new password. It expires in 1 hour.',
    codeLabel: 'Reset code',
    footer:
      "If you didn't ask to reset your password, you can safely ignore this email. Your password stays as it is.",
  },
  verifyAttribute: {
    subject: 'Confirm your new email address',
    heading: 'Confirm your new email address',
    intro:
      'Enter this code in Vocably to start using this address with your account.',
    codeLabel: 'Confirmation code',
    footer:
      "If you didn't ask to change your email address, please reply to this email.",
  },
  invite: {
    subject: 'Your Vocably account',
    heading: 'Your Vocably account is ready',
    intro: 'Sign in with the username and temporary password below.',
    usernameLabel: 'Username',
    passwordLabel: 'Temporary password',
    outro:
      "You'll be asked to choose your own password when you first sign in.",
    footer:
      'If you were not expecting this email, please reply and let me know.',
  },
};

export type AuthEmailTranslation = typeof en;
