import { Result, TTSPayload } from '@vocably/model';
import { tts } from '@vocably/api';

export const playAudioPronunciation = async (
  payload: TTSPayload
): Promise<Result<true>> => {
  const result = await tts(window['apiBaseUrl'], payload);

  if (result.success === false) {
    return result;
  }

  return new Promise((resolve) => {
    try {
      const audio = new Audio(
        `data:audio/mpeg;base64,` + result.value.audioContent
      );
      audio.addEventListener('ended', () => {
        resolve({
          success: true,
          value: true,
        });
      });
      audio.play().catch((e) => {
        resolve({
          success: false,
          errorCode: 'UNABLE_TO_PLAY_AUDIO_DATA_URL',
          reason: 'An error occurred while playing the offscreen audio',
          extra: e,
        });
      });
    } catch (e) {
      resolve({
        success: false,
        errorCode: 'UNABLE_TO_PLAY_AUDIO_DATA_URL',
        reason: 'An error occurred while playing the offscreen audio',
        extra: e,
      });
    }
  });
};
