import {
  AudioPronunciationPayload,
  AudioPronunciationResponse,
  Result,
} from '@vocably/model';
import { publicRequest } from './publicRestClient';

export const publicPlaySound = async (
  payload: AudioPronunciationPayload
): Promise<Result<AudioPronunciationResponse>> => {
  try {
    return await publicRequest('/audio?' + new URLSearchParams(payload), {
      method: 'GET',
    });
  } catch (e) {
    return {
      success: false,
      errorCode: 'API_PUBLIC_PLAY_SOUND_REQUEST_FAILED',
      reason: 'Play sound request has failed.',
      extra: e,
    };
  }
};
