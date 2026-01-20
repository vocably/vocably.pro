import {
  Result,
  UnitOfSpeechGenerationMessageAssistant,
  UnitOfSpeechGenerationPayload,
} from '@vocably/model';
import { request } from './restClient';

export const generateUnitsOfSpeech = async (
  payload: UnitOfSpeechGenerationPayload,
  abortController?: AbortController
): Promise<Result<UnitOfSpeechGenerationMessageAssistant>> => {
  try {
    return await request('/generate-units-of-speech', {
      method: 'POST',
      body: JSON.stringify(payload),
      signal: abortController?.signal,
    });
  } catch (e) {
    return {
      success: false,
      errorCode: 'API_TRANSLATION_REQUEST_FAILED',
      reason: 'The translation request has failed.',
      extra: e,
    };
  }
};
