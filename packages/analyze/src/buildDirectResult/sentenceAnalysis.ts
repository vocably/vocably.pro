import {
  DetectedInputType,
  DirectAnalysis,
  GoogleLanguage,
  Result,
  Translation,
} from '@vocably/model';

import { googleTranslate } from '../googleTranslate';
import { translationToAnalysisItem } from '../translationToAnalyzeItem';

type Payload = {
  source: string;
  sourceLanguage: GoogleLanguage;
  targetLanguage: GoogleLanguage;
  isDirect: boolean;
  inputType: DetectedInputType;
  translation?: Translation;
};

export const sentenceAnalysis = async ({
  source,
  sourceLanguage,
  targetLanguage,
  isDirect,
  inputType,
  translation: preTranslatedTranslation,
}: Payload): Promise<Result<DirectAnalysis>> => {
  let translation: Translation | undefined = preTranslatedTranslation;

  if (!translation) {
    const translationIntoTargetLanguageResult = await googleTranslate(
      source,
      null,
      targetLanguage
    );

    if (translationIntoTargetLanguageResult.success === false) {
      return translationIntoTargetLanguageResult;
    }

    translation = {
      source: source,
      target: translationIntoTargetLanguageResult.value.target,
      sourceLanguage: sourceLanguage,
      targetLanguage: targetLanguage,
    };
  }

  return {
    success: true,
    value: {
      source: source,
      sourceLanguage: translation.sourceLanguage,
      targetLanguage: translation.targetLanguage,
      translation,
      items: [
        {
          ...translationToAnalysisItem({
            source,
            target: translation.target,
            sourceLanguage: sourceLanguage,
            targetLanguage: targetLanguage,
            transcript: translation.transcript,
          }),
          partOfSpeech: inputType,
        },
      ],
      isDirect,
      detectedInputType: inputType,
    },
  };
};
