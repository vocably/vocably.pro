import { Result } from '@vocably/model';
import { publicRequest } from './publicRestClient';

export const sendPublicUserFeedback = async (payload: {
  feedback: string;
  metadata?: any;
}): Promise<Result<null>> => {
  try {
    return await publicRequest('/feedback', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch (e) {
    return {
      success: false,
      errorCode: 'USER_FEEDBACK_REQUEST_FAILED',
      reason: 'The user feedback request failed.',
      extra: e,
    };
  }
};
