import { TTSPayload, TTSResponse, Result, isTTSResponse } from '@vocably/model';
import { request } from '@vocably/model-operations';

export const tts = async (
  baseUrl: string,
  payload: TTSPayload,
  abortController?: AbortController
): Promise<Result<TTSResponse>> => {
  const response = await request(baseUrl + '/tts', {
    method: 'POST',
    body: JSON.stringify(payload),
    signal: abortController?.signal,
  });

  if (response.success === false) {
    return response;
  }

  if (!isTTSResponse(response.value)) {
    return {
      success: false,
      reason: 'The TTS response is invalid.',
      errorCode: 'TTS_ERROR',
      extra: response.value,
    };
  }

  return response;
};
