import { Result, resultify } from '@vocably/model';
import {
  getPermissionStatus,
  identifyUser,
} from 'aws-amplify/push-notifications';
import { debounce } from 'lodash-es';
import { getFlatAttributes } from './auth/getFlatAttributes';
import { safeFetchAuthSession } from './auth/safeFunctions';
import { Sentry } from './BetterSentry';

export const notificationsIdentifyUser = debounce(
  async (): Promise<Result<unknown>> => {
    console.log('Identifying user');
    const status = await getPermissionStatus();
    if (status !== 'granted') {
      console.log("Notifications permission is not granted. Can't identify.");
      return {
        success: true,
        value: null,
      };
    }

    const sessionResult = await resultify(safeFetchAuthSession(), {
      errorCode: 'AUTH_UNABLE_TO_GET_USER_SESSION',
      reason: 'Unable to fetch auth session',
    });

    if (
      sessionResult.success === false ||
      !sessionResult.value.tokens ||
      !sessionResult.value.userSub
    ) {
      console.log("User is not logged in. Can't identify.", sessionResult);
      return {
        success: true,
        value: null,
      };
    }

    const attributes = await getFlatAttributes();

    if (!attributes['sub'] || !attributes['email']) {
      console.error('Unable to get user sub and email', attributes);
      Sentry.captureMessage(
        'Unable to get user sub and email in notificationsIdentifyUser'
      );
      return {
        success: false,
        errorCode: 'AUTH_UNABLE_TO_GET_USER_ATTRIBUTES',
        reason: 'Unable to get user sub and email',
      };
    }

    const identifyUserResult = await resultify(
      identifyUser({
        userId: sessionResult.value.userSub,
        userProfile: {},
        options: {
          optOut: 'NONE',
        },
      }),
      {
        errorCode: 'NOTIFICATIONS_UNABLE_TO_IDENTIFY_USER',
        reason: 'Unable to identify user',
      }
    );

    if (identifyUserResult.success === false) {
      Sentry.captureMessage('Unable to identify user', {
        extra: identifyUserResult,
      });
    }

    return identifyUserResult;
  },
  1000
);
