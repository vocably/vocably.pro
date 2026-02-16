import { nodeSaveUserMetadata } from '@vocably/lambda-shared';
import { Callback, Context, PostConfirmationTriggerEvent } from 'aws-lambda';
import { adminGetUser } from './adminGetUser';
import { addContact } from './brevo';
import { getAttribute } from './getAttribute';

export const authPostConfirmation = async (
  event: PostConfirmationTriggerEvent,
  _context: Context,
  callback: Callback
): Promise<void> => {
  const { userPoolId, userName } = event;

  try {
    // await adminAddUserToGroup({
    //   userPoolId,
    //   username: userName,
    //   groupName: 'paid',
    // });

    const user = await adminGetUser({
      userPoolId,
      username: userName,
    });

    const email = getAttribute(user, 'email');
    const sub = getAttribute(user, 'sub');

    if (!email || !sub) {
      return callback('Unable to determine email or sub', {
        email,
        sub,
      });
    }

    console.log(
      `A user with email ${email} and sub ${sub} is attempting to register.`
    );

    const addContactResult = await addContact({ email });

    if (addContactResult.success === false) {
      console.error('Brevo failed to add contact', addContactResult);
    }

    const saveMetadataResult = await nodeSaveUserMetadata(
      sub,
      process.env.USER_FILES_BUCKET,
      {
        onboardingFlow: {
          allowed: true,
          mobileAppSent: false,
          extensionSent: false,
        },
      }
    );

    if (saveMetadataResult.success === false) {
      console.error('Save metadata error', saveMetadataResult);
    }

    return callback(null, event);
  } catch (error) {
    console.error('An error in post confirmation lambda occurred', error);
    return callback(error, event);
  }
};
