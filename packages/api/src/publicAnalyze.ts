import { Analysis, AnalyzePayload, Result } from '@vocably/model';
import { publicRequest } from './publicRestClient';

export const publicAnalyze = async (
  payload: AnalyzePayload,
  abortController?: AbortController
): Promise<Result<Analysis>> => {
  try {
    return await publicRequest('/analyze', {
      method: 'POST',
      body: JSON.stringify(payload),
      signal: abortController?.signal,
    });
  } catch (e) {
    return {
      success: false,
      errorCode: 'API_PUBLIC_ANALYZE_REQUEST_FAILED',
      reason: 'The analyze request has failed.',
      extra: e,
    };
  }
};
