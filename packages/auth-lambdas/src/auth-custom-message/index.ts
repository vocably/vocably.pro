import { Callback, Context, CustomMessageTriggerEvent } from 'aws-lambda';
import { renderEmail } from './layout';
import { AuthEmailTranslation, resolveTranslation } from './templates';

/**
 * Builds the subject and HTML body for one trigger source, or returns null to
 * let Cognito fall back to the user pool's own message template.
 *
 * `codeParameter` and `usernameParameter` are placeholders that Cognito
 * substitutes after this function returns, so they must appear verbatim in the
 * output - hence reading them off the request rather than hardcoding "{####}".
 */
const buildMessage = (
  event: CustomMessageTriggerEvent,
  t: AuthEmailTranslation
): { subject: string; body: string } | null => {
  const { codeParameter, usernameParameter } = event.request;

  switch (event.triggerSource) {
    case 'CustomMessage_SignUp':
    case 'CustomMessage_ResendCode':
      return {
        subject: t.verifyEmail.subject,
        body: renderEmail({
          heading: t.verifyEmail.heading,
          paragraphs: [t.verifyEmail.intro],
          fields: [{ label: t.verifyEmail.codeLabel, value: codeParameter }],
          footer: t.verifyEmail.footer,
        }),
      };

    case 'CustomMessage_ForgotPassword':
      return {
        subject: t.resetPassword.subject,
        body: renderEmail({
          heading: t.resetPassword.heading,
          paragraphs: [t.resetPassword.intro],
          fields: [{ label: t.resetPassword.codeLabel, value: codeParameter }],
          footer: t.resetPassword.footer,
        }),
      };

    case 'CustomMessage_UpdateUserAttribute':
    case 'CustomMessage_VerifyUserAttribute':
      return {
        subject: t.verifyAttribute.subject,
        body: renderEmail({
          heading: t.verifyAttribute.heading,
          paragraphs: [t.verifyAttribute.intro],
          fields: [
            { label: t.verifyAttribute.codeLabel, value: codeParameter },
          ],
          footer: t.verifyAttribute.footer,
        }),
      };

    case 'CustomMessage_AdminCreateUser':
      // The only message that must carry the username as well as the code:
      // an admin-created user has no way to learn it otherwise.
      return {
        subject: t.invite.subject,
        body: renderEmail({
          heading: t.invite.heading,
          paragraphs: [t.invite.intro],
          fields: [
            { label: t.invite.usernameLabel, value: usernameParameter },
            { label: t.invite.passwordLabel, value: codeParameter },
          ],
          footer: `${t.invite.outro} ${t.invite.footer}`,
        }),
      };

    default:
      return null;
  }
};

export const authCustomMessage = async (
  event: CustomMessageTriggerEvent,
  _context: Context,
  callback: Callback
): Promise<void> => {
  try {
    const { locale, translation } = resolveTranslation(
      event.request.clientMetadata,
      event.request.userAttributes
    );

    const message = buildMessage(event, translation);

    if (message === null) {
      // Leaving the response untouched makes Cognito use its own template, so
      // the user still receives something. Logged at error level so the
      // metric filter alarm fires and the gap gets closed - silently sending
      // nothing here would mean an account nobody can verify or recover.
      console.error(
        `error: unhandled custom message trigger source ${event.triggerSource}, falling back to the Cognito default template`
      );
      return callback(null, event);
    }

    event.response.emailSubject = message.subject;
    event.response.emailMessage = message.body;

    console.log(
      `Rendered ${event.triggerSource} in "${locale}" (${message.body.length} chars).`
    );

    return callback(null, event);
  } catch (error) {
    console.error('An error in custom message lambda occurred', error);
    return callback(error, event);
  }
};
