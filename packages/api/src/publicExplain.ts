import { ExplainPayload, Explanation, Result } from '@vocably/model';
import { publicRequest } from './publicRestClient';

export const publicExplain = async (
  payload: ExplainPayload,
  abortController?: AbortController
): Promise<Result<Explanation>> => {
  try {
    return await publicRequest('/explain', {
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
