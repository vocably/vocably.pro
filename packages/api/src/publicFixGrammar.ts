import { FixGrammarPayload, FixGrammarResponse, Result } from '@vocably/model';
import { publicRequest } from './publicRestClient';

export const publicFixGrammar = async (
  payload: FixGrammarPayload,
  abortController?: AbortController
): Promise<Result<FixGrammarResponse>> => {
  try {
    return await publicRequest('/fix-grammar', {
      method: 'POST',
      body: JSON.stringify(payload),
      signal: abortController?.signal,
    });
  } catch (e) {
    return {
      success: false,
      errorCode: 'API_PUBLIC_FIX_GRAMMAR_REQUEST_FAILED',
      reason: 'The fix-grammar request has failed.',
      extra: e,
    };
  }
};
