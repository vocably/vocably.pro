import {
  checkPassword,
  getAuthErrorCode,
  isPasswordValid,
  isValidEmail,
  normalizeEmail,
} from './auth';

const cognitoError = (name: string, message = '') =>
  Object.assign(new Error(message), { name });

describe('normalizeEmail', () => {
  it('trims and lowercases', () => {
    expect(normalizeEmail('  Someone@Example.COM ')).toEqual(
      'someone@example.com'
    );
  });
});

describe('isValidEmail', () => {
  it('accepts a regular address', () => {
    expect(isValidEmail(' Someone@Example.com ')).toBe(true);
  });

  for (const email of [
    '',
    'someone',
    'someone@example',
    'a"b@example.com',
    'a b@c.de',
  ]) {
    it(`rejects "${email}"`, () => {
      expect(isValidEmail(email)).toBe(false);
    });
  }
});

describe('checkPassword', () => {
  it('reports every missing requirement', () => {
    expect(checkPassword('abc')).toEqual({
      minLength: false,
      lowercase: true,
      uppercase: false,
      digit: false,
      symbol: false,
    });
  });

  it('accepts a password that satisfies the Cognito default policy', () => {
    expect(isPasswordValid('Aa1!aaaa')).toBe(true);
  });

  it('counts a space as a symbol', () => {
    expect(checkPassword('Aa1 aaaa').symbol).toBe(true);
  });

  it('does not count a non-Latin letter as a symbol', () => {
    expect(checkPassword('Aa1яяяяя').symbol).toBe(false);
  });
});

describe('getAuthErrorCode', () => {
  for (const [name, code] of [
    ['NotAuthorizedException', 'invalidCredentials'],
    ['UserNotConfirmedException', 'userNotConfirmed'],
    ['UsernameExistsException', 'usernameExists'],
    ['CodeMismatchException', 'codeMismatch'],
    ['ExpiredCodeException', 'codeExpired'],
    ['LimitExceededException', 'tooManyAttempts'],
    ['InvalidPasswordException', 'invalidPassword'],
    ['NetworkError', 'network'],
    ['UserCancelledException', 'cancelled'],
    ['SomethingElse', 'unknown'],
  ]) {
    it(`maps ${name} to ${code}`, () => {
      expect(getAuthErrorCode(cognitoError(name))).toEqual(code);
    });
  }

  it('recognizes too many password attempts', () => {
    expect(
      getAuthErrorCode(
        cognitoError('NotAuthorizedException', 'Password attempts exceeded')
      )
    ).toEqual('tooManyAttempts');
  });

  for (const [providers, code] of [
    ['Google', 'emailTakenGoogle'],
    ['Apple', 'emailTakenApple'],
    ['Google or Apple', 'emailTakenGoogleOrApple'],
    ['your email and password', 'emailTakenPassword'],
  ]) {
    it(`recognizes the pre sign-up conflict with ${providers}`, () => {
      expect(
        getAuthErrorCode(
          cognitoError(
            'UserLambdaValidationException',
            `PreSignUp failed with error An account with this email already exists. Please sign in with ${providers}.`
          )
        )
      ).toEqual(code);
    });
  }

  it('recognizes a cancelled redirect', () => {
    expect(
      getAuthErrorCode(
        cognitoError('OAuthSignInException', 'User cancelled OAuth flow.')
      )
    ).toEqual('cancelled');
    expect(
      getAuthErrorCode(
        cognitoError(
          'OAuthSignInException',
          '`signInWithRedirect` has been canceled.'
        )
      )
    ).toEqual('cancelled');
    expect(
      getAuthErrorCode(cognitoError('OAuthSignInException', 'canceled'))
    ).toEqual('cancelled');
  });

  it('recognizes the missing email rejection', () => {
    expect(
      getAuthErrorCode(
        cognitoError(
          'UserLambdaValidationException',
          'PreSignUp failed with error An email address is required. Please sign up in the Vocably app.'
        )
      )
    ).toEqual('invalidEmail');
  });

  it('parses a raw, URL-encoded error_description', () => {
    expect(
      getAuthErrorCode(
        'PreSignUp+failed+with+error+An+account+with+this+email+already+exists.+Please+sign+in+with+your+email+and+password.+'
      )
    ).toEqual('emailTakenPassword');
  });

  it('survives garbage', () => {
    expect(getAuthErrorCode(undefined)).toEqual('unknown');
    expect(getAuthErrorCode(42)).toEqual('unknown');
    expect(getAuthErrorCode('%E0%A4%A')).toEqual('unknown');
  });
});
