import {
  Result,
  UnitOfSpeechGenerationMessageAssistant,
  UnitOfSpeechGenerationPayload,
} from '@vocably/model';
import { publicRequest } from './publicRestClient';

export const publicGenerateUnitsOfSpeech = async (
  payload: UnitOfSpeechGenerationPayload,
  abortController?: AbortController
): Promise<Result<UnitOfSpeechGenerationMessageAssistant>> => {
  try {
    return await publicRequest('/generate-units-of-speech', {
      method: 'POST',
      body: JSON.stringify(payload),
      signal: abortController?.signal,
    });
  } catch (e) {
    return {
      success: false,
      errorCode: 'API_PUBLIC_GENERATE_UNITS_OF_SPEECH_REQUEST_FAILED',
      reason: 'The generate units of speech request has failed.',
      extra: e,
    };
  }
};
