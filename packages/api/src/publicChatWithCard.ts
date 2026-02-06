import {
  ChatWithCardPayload,
  ChatWithCardResult,
  Result,
} from '@vocably/model';
import { publicRequest } from './publicRestClient';

export const publicChatWithCard = async (
  payload: ChatWithCardPayload,
  abortController?: AbortController
): Promise<Result<ChatWithCardResult>> => {
  try {
    return await publicRequest('/chat-with-card', {
      method: 'POST',
      body: JSON.stringify(payload),
      signal: abortController?.signal,
    });
  } catch (e) {
    return {
      success: false,
      errorCode: 'API_PUBLIC_CHAT_WITH_CARD_REQUEST_FAILED',
      reason: 'The chat with card request has failed.',
      extra: e,
    };
  }
};
