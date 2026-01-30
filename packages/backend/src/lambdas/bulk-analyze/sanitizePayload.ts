import { BulkAnalysisPayload } from '@vocably/model';

export const sanitizePayload = (
  payload: BulkAnalysisPayload
): BulkAnalysisPayload => {
  return {
    ...payload,
    sources: payload.sources.slice(0, 10000),
  };
};
