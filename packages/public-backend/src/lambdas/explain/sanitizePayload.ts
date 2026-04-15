import { ExplainPayload } from '@vocably/model';

export const sanitizePayload = (payload: ExplainPayload): ExplainPayload => {
  return {
    ...payload,
    source: payload.source.slice(0, 1000),
  };
};
