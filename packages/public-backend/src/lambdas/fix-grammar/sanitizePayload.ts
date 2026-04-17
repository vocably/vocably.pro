import { FixGrammarPayload } from '@vocably/model';

export const sanitizePayload = (
  payload: FixGrammarPayload
): FixGrammarPayload => {
  return {
    ...payload,
    text: payload.text.slice(0, 1000),
    context: payload.context?.slice(0, 1000),
  };
};
