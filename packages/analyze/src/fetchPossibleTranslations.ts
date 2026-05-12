import {
  DetectedInputType,
  GoogleLanguage,
  Result,
  Translation,
} from '@vocably/model';
import {
  aiFetchPossibleTranslations,
  aiFetchPossibleTranslationsCached,
} from './aiFetchPossibleTranslations';
import { googleTranslate } from './googleTranslate';

type Payload = {
  source: string;
  sourceLanguage: GoogleLanguage;
  targetLanguage: GoogleLanguage;
  inputType?: DetectedInputType;
};

export type ValidTranslations = [Translation, ...Translation[]];

export const fetchPossibleTranslations = async (
  payload: Payload
): Promise<Result<ValidTranslations>> => {
  const aiTranslationResult = await aiFetchPossibleTranslationsCached(payload);

  if (aiTranslationResult.success) {
    return aiTranslationResult;
  }

  const googleResult = await googleTranslate(
    payload.source,
    payload.sourceLanguage,
    payload.targetLanguage
  );

  if (googleResult.success === false) {
    return googleResult;
  }

  return {
    success: true,
    value: [googleResult.value],
  };
};
