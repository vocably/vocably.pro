import { BatchUnitOfSpeechAnalyzePayload } from '@vocably/model';

export const sanitizePayload = (payload: BatchUnitOfSpeechAnalyzePayload) => {
  return {
    ...payload,
    unitsOfSpeech: payload.unitsOfSpeech.slice(0, 50),
  };
};
