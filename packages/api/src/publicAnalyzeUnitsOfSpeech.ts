import {
  BatchUnitOfSpeechAnalysis,
  BatchUnitOfSpeechAnalyzePayload,
  Result,
} from '@vocably/model';
import { publicRequest } from './publicRestClient';

export const publicAnalyzeUnitsOfSpeech = async (
  payload: BatchUnitOfSpeechAnalyzePayload,
  abortController?: AbortController
): Promise<Result<BatchUnitOfSpeechAnalysis>> => {
  try {
    return await publicRequest('/analyze-units-of-speech', {
      method: 'POST',
      body: JSON.stringify(payload),
      signal: abortController?.signal,
    });
  } catch (e) {
    return {
      success: false,
      errorCode: 'API_PUBLIC_ANALYZE_UNITS_OF_SPEECH_REQUEST_FAILED',
      reason: 'The analyze units of speech request has failed.',
      extra: e,
    };
  }
};
