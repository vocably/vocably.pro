import { Analysis, ExplainPayload } from '@vocably/model';

export const createExplainPayload = (
  analysis: Analysis
): ExplainPayload | null => {
  if (!['sentence', 'phrase'].includes(analysis.detectedInputType)) {
    return null;
  }

  return {
    source: analysis.source,
    sourceLanguage: analysis.sourceLanguage,
    targetLanguage: analysis.targetLanguage,
  };
};
