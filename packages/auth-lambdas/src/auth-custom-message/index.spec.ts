import { describe, expect, it, jest } from '@jest/globals';
import { Context, CustomMessageTriggerEvent } from 'aws-lambda';
import { authCustomMessage } from './index';

const buildEvent = (
  overrides: Partial<CustomMessageTriggerEvent> & {
    triggerSource: CustomMessageTriggerEvent['triggerSource'];
  }
): CustomMessageTriggerEvent =>
  ({
    version: '1',
    region: 'eu-central-1',
    userPoolId: 'eu-central-1_test',
    userName: 'someone@example.com',
    callerContext: { awsSdkVersion: 'test', clientId: 'test-client' },
    request: {
      userAttributes: { email: 'someone@example.com' },
      codeParameter: '{####}',
      usernameParameter: '{username}',
      linkParameter: '{##Click Here##}',
      clientMetadata: undefined,
    },
    response: { smsMessage: '', emailMessage: '', emailSubject: '' },
    ...overrides,
  }) as CustomMessageTriggerEvent;

const invoke = async (event: CustomMessageTriggerEvent) => {
  const callback = jest.fn();
  await authCustomMessage(event, {} as Context, callback);
  return { callback, response: event.response };
};

describe('authCustomMessage', () => {
  it('renders the sign up code in English by default', async () => {
    const { callback, response } = await invoke(
      buildEvent({ triggerSource: 'CustomMessage_SignUp' })
    );

    expect(callback).toHaveBeenCalledWith(null, expect.anything());
    expect(response.emailSubject).toEqual('Confirm your email address');
    expect(response.emailMessage).toContain('Confirmation code');
  });

  it('uses the locale from clientMetadata', async () => {
    const event = buildEvent({ triggerSource: 'CustomMessage_ForgotPassword' });
    event.request.clientMetadata = { locale: 'ru' };

    const { response } = await invoke(event);

    expect(response.emailSubject).toEqual('Сброс пароля');
  });

  it('falls back to the locale user attribute', async () => {
    const event = buildEvent({ triggerSource: 'CustomMessage_SignUp' });
    event.request.userAttributes.locale = 'uk';

    const { response } = await invoke(event);

    expect(response.emailSubject).toEqual(
      'Підтвердьте адресу електронної пошти'
    );
  });

  it('normalizes a regional locale tag', async () => {
    const event = buildEvent({ triggerSource: 'CustomMessage_SignUp' });
    event.request.clientMetadata = { locale: 'pt-BR' };

    const { response } = await invoke(event);

    expect(response.emailSubject).toEqual('Confirme seu endereço de e-mail');
  });

  it('ignores an unknown locale', async () => {
    const event = buildEvent({ triggerSource: 'CustomMessage_SignUp' });
    event.request.clientMetadata = { locale: 'kl' };

    const { response } = await invoke(event);

    expect(response.emailSubject).toEqual('Confirm your email address');
  });

  // Cognito substitutes these placeholders after the trigger returns, so
  // dropping them sends an email with no code in it.
  it.each([
    'CustomMessage_SignUp',
    'CustomMessage_ResendCode',
    'CustomMessage_ForgotPassword',
    'CustomMessage_UpdateUserAttribute',
    'CustomMessage_VerifyUserAttribute',
    'CustomMessage_AdminCreateUser',
  ] as const)('keeps the code placeholder for %s', async (triggerSource) => {
    const { response } = await invoke(buildEvent({ triggerSource }));

    expect(response.emailMessage).toContain('{####}');
    expect(response.emailSubject).toBeTruthy();
    // Cognito rejects anything longer than 20,000 UTF-8 characters.
    expect(response.emailMessage.length).toBeLessThan(20000);
  });

  it('includes the username placeholder in the invitation', async () => {
    const { response } = await invoke(
      buildEvent({ triggerSource: 'CustomMessage_AdminCreateUser' })
    );

    expect(response.emailMessage).toContain('{username}');
  });

  it('leaves the response alone for an unhandled trigger source', async () => {
    const { callback, response } = await invoke(
      buildEvent({
        triggerSource:
          'CustomMessage_Authentication' as CustomMessageTriggerEvent['triggerSource'],
      })
    );

    expect(callback).toHaveBeenCalledWith(null, expect.anything());
    expect(response.emailMessage).toEqual('');
    expect(response.emailSubject).toEqual('');
  });
});
