import { FixGrammarPayload, FixGrammarResponse, Result } from '@vocably/model';
import { request } from '@vocably/model-operations';

export const fixGrammar = async (
  payload: FixGrammarPayload,
  abortController?: AbortController
): Promise<Result<FixGrammarResponse>> => {
  return request(`${window['publicApiBaseUrl']}/fix-grammar`, {
    method: 'POST',
    body: JSON.stringify(payload),
    signal: abortController?.signal,
  });
};
