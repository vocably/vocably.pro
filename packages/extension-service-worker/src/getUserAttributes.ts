import { mapUserAttributes, Result, UserData } from '@vocably/model';
import { fetchUserAttributes, getCurrentUser } from 'aws-amplify/auth';

export const getUserAttributes = async (): Promise<Result<UserData>> => {
  const user = await getCurrentUser().catch(() => null);

  if (!user) {
    return {
      success: false,
      errorCode: 'AUTH_UNABLE_TO_GET_USER_SESSION',
      reason: `Unable to get current user`,
    };
  }

  try {
    const attributes = await fetchUserAttributes();
    return {
      success: true,
      value: mapUserAttributes({ username: user.username, attributes }),
    };
  } catch (e) {
    return {
      success: false,
      errorCode: 'AUTH_UNABLE_TO_GET_USER_ATTRIBUTES',
      reason: `Unable to get current user`,
      extra: e,
    };
  }
};
