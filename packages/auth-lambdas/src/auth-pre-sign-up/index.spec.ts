import { UserType } from '@aws-sdk/client-cognito-identity-provider';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Callback, Context, PreSignUpTriggerEvent } from 'aws-lambda';

type ListUsersByEmail = (args: {
  userPoolId: string;
  email: string;
}) => Promise<UserType[]>;

const listUsersByEmail = jest.fn<ListUsersByEmail>();
jest.mock('./listUsersByEmail', () => ({
  listUsersByEmail: (...args: Parameters<ListUsersByEmail>) =>
    listUsersByEmail(...args),
}));

import { authPreSignUp } from './index';

const buildEvent = (
  triggerSource: PreSignUpTriggerEvent['triggerSource'],
  userAttributes: Record<string, string>,
  userName = 'someone@example.com'
): PreSignUpTriggerEvent =>
  ({
    version: '1',
    region: 'eu-central-1',
    userPoolId: 'eu-central-1_test',
    userName,
    triggerSource,
    callerContext: { awsSdkVersion: 'test', clientId: 'test-client' },
    request: { userAttributes, validationData: {} },
    response: {
      autoConfirmUser: false,
      autoVerifyEmail: false,
      autoVerifyPhone: false,
    },
  }) as PreSignUpTriggerEvent;

const invoke = async (event: PreSignUpTriggerEvent) => {
  const callback = jest.fn<Callback>();
  await authPreSignUp(event, {} as Context, callback);
  return callback;
};

const errorFrom = (callback: jest.Mock<Callback>): Error =>
  callback.mock.calls[0][0] as Error;

describe('authPreSignUp', () => {
  beforeEach(() => {
    listUsersByEmail.mockReset();
    listUsersByEmail.mockResolvedValue([]);
  });

  it('allows a sign up with an unused email', async () => {
    const callback = await invoke(
      buildEvent('PreSignUp_SignUp', { email: 'someone@example.com' })
    );

    expect(callback).toHaveBeenCalledWith(null, expect.anything());
  });

  it('never auto-confirms, so the email still has to be verified', async () => {
    const event = buildEvent('PreSignUp_SignUp', {
      email: 'someone@example.com',
    });

    await invoke(event);

    expect(event.response.autoConfirmUser).toBe(false);
    expect(event.response.autoVerifyEmail).toBe(false);
  });

  // Managed login's sign-up form cannot render an email field on this pool.
  it('rejects a sign up with no email', async () => {
    const callback = await invoke(buildEvent('PreSignUp_SignUp', {}));

    expect(errorFrom(callback).message).toContain('email address is required');
    expect(listUsersByEmail).not.toHaveBeenCalled();
  });

  it('rejects an email that would break out of the ListUsers filter', async () => {
    const callback = await invoke(
      buildEvent('PreSignUp_SignUp', { email: 'a"b@example.com' })
    );

    expect(errorFrom(callback).message).toContain('email address is required');
    expect(listUsersByEmail).not.toHaveBeenCalled();
  });

  it('lowercases the email before looking it up', async () => {
    await invoke(
      buildEvent('PreSignUp_SignUp', { email: '  Someone@Example.COM ' })
    );

    expect(listUsersByEmail).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'someone@example.com' })
    );
  });

  it('rejects an email already used by a Google account', async () => {
    listUsersByEmail.mockResolvedValue([{ Username: 'Google_12345' }]);

    const callback = await invoke(
      buildEvent('PreSignUp_SignUp', { email: 'someone@example.com' })
    );

    expect(errorFrom(callback).message).toContain('already exists');
    expect(errorFrom(callback).message).toContain('Google');
  });

  it('names Apple when the conflict is an Apple account', async () => {
    listUsersByEmail.mockResolvedValue([
      { Username: 'SignInWithApple_00164.abc.1320' },
    ]);

    const callback = await invoke(
      buildEvent('PreSignUp_SignUp', { email: 'someone@example.com' })
    );

    expect(errorFrom(callback).message).toContain('Apple');
  });

  it('rejects a new federated identity claiming an existing email', async () => {
    listUsersByEmail.mockResolvedValue([{ Username: 'someone@example.com' }]);

    const callback = await invoke(
      buildEvent(
        'PreSignUp_ExternalProvider',
        { email: 'someone@example.com' },
        'Google_12345'
      )
    );

    expect(errorFrom(callback).message).toContain('email and password');
  });

  it('ignores a match on the user being created', async () => {
    listUsersByEmail.mockResolvedValue([{ Username: 'someone@example.com' }]);

    const callback = await invoke(
      buildEvent('PreSignUp_SignUp', { email: 'someone@example.com' })
    );

    expect(callback).toHaveBeenCalledWith(null, expect.anything());
  });

  // AdminCreateUser is trusted and may legitimately omit attributes.
  it('lets admin-created users through untouched', async () => {
    const callback = await invoke(buildEvent('PreSignUp_AdminCreateUser', {}));

    expect(callback).toHaveBeenCalledWith(null, expect.anything());
    expect(listUsersByEmail).not.toHaveBeenCalled();
  });

  it('fails closed when the lookup throws', async () => {
    listUsersByEmail.mockRejectedValue(new Error('throttled'));

    const callback = await invoke(
      buildEvent('PreSignUp_SignUp', { email: 'someone@example.com' })
    );

    expect(errorFrom(callback)).toBeInstanceOf(Error);
  });
});
