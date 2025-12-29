import {
  DirectAnalysis,
  GoogleLanguage,
  isSuccess,
  Result,
  Translation,
  ValidAnalysisItems,
} from '@vocably/model';

import { trimSenselessArticle } from '@vocably/sulna';
import { analyseAndTranslate } from '../analyseAndTranslate';
import { buildDirectAnalyseBatch } from '../buildDirectAnalyseBatch';
import { getPartsOfSpeech, PartOfSpeech } from '../getPartsOfSpeech';
import { googleTranslate } from '../googleTranslate';
import { translationToAnalysisItem } from '../translationToAnalyzeItem';

type Payload = {
  source: string;
  sourceLanguage: GoogleLanguage;
  targetLanguage: GoogleLanguage;
  predefinedPartsOfSpeech?: PartOfSpeech[];
};

export const unitOfSpeechAnalysis = async ({
  source,
  sourceLanguage,
  targetLanguage,
  predefinedPartsOfSpeech = [],
}: Payload): Promise<Result<DirectAnalysis>> => {
  const trimmedSource = trimSenselessArticle(sourceLanguage, source);

  const translationResult = await googleTranslate(source, null, targetLanguage);

  if (translationResult.success === false) {
    return translationResult;
  }

  const translation: Translation = {
    source: source,
    target: translationResult.value.target,
    sourceLanguage: sourceLanguage,
    targetLanguage: targetLanguage,
  };

  let partsOfSpeech = predefinedPartsOfSpeech;
  if (partsOfSpeech.length === 0) {
    const partsOfSpeechResult = await getPartsOfSpeech({
      source: trimmedSource,
      language: translation.sourceLanguage,
    });

    partsOfSpeech = partsOfSpeechResult.success
      ? partsOfSpeechResult.value.filter((p) => p.exists)
      : [];
  }

  const analyseResults = (
    await Promise.all(
      buildDirectAnalyseBatch({
        translation: {
          ...translation,
          source: trimmedSource,
        },
        partsOfSpeech: partsOfSpeech,
      }).map((payload) => analyseAndTranslate(payload))
    )
  ).filter(isSuccess);

  const resultItems: ValidAnalysisItems = [
    translationToAnalysisItem(translationResult.value),
  ];

  if (analyseResults.length === 0) {
    return {
      success: true,
      value: {
        source: source,
        targetLanguage: targetLanguage,
        sourceLanguage: sourceLanguage,
        translation: translation,
        items: resultItems,
      },
    };
  }

  resultItems[0] = analyseResults[0].value;

  analyseResults.slice(1).forEach((result) => {
    resultItems.push(result.value);
  });

  return {
    success: true,
    value: {
      source: source,
      targetLanguage: targetLanguage,
      sourceLanguage: sourceLanguage,
      translation: translation,
      items: resultItems,
    },
  };
};
