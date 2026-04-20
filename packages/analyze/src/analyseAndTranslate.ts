import {
  AnalysisItem,
  GoogleLanguage,
  isAnalysisNumber,
  isTense,
  languageList,
  Result,
} from '@vocably/model';
import { sanitizeTranscript } from '@vocably/sulna';
import { addArticle } from './addArticle';
import { aiAnalyse } from './aiUnitOfSpeechAnalyse';
import { translateUnitOfSpeech } from './translateUnitOfSpeech';

export type AnalyseAndTranslatePayload = {
  source: string;
  sourceLanguage: GoogleLanguage;
  targetLanguage: GoogleLanguage;
  partOfSpeech: string;
};

export const analyseAndTranslate = async (
  payload: AnalyseAndTranslatePayload
): Promise<Result<AnalysisItem>> => {
  const aiAnalyseResult = await aiAnalyse(payload);
  if (aiAnalyseResult.success === false) {
    return aiAnalyseResult;
  }

  if (aiAnalyseResult.value.exists === false) {
    return {
      success: false,
      reason: `The requested word/phrase "${
        payload.source
      }" does not exist in ${
        languageList[payload.sourceLanguage]
      } (according to AI).`,
    };
  }

  let translation = '';
  let definitions = aiAnalyseResult.value.definitions;
  let examples = aiAnalyseResult.value.examples;

  if (payload.sourceLanguage !== payload.targetLanguage) {
    const translationResult = await translateUnitOfSpeech({
      source: payload.source,
      sourceLanguage: payload.sourceLanguage,
      targetLanguage: payload.targetLanguage,
      partOfSpeech: payload.partOfSpeech,
      definitions: aiAnalyseResult.value.definitions,
      examples: aiAnalyseResult.value.examples,
      number: aiAnalyseResult.value.number,
    });

    if (translationResult.success === false) {
      return translationResult;
    }

    translation = translationResult.value.join(', ');
  }

  const analysisItem: AnalysisItem = {
    source: addArticle(
      payload.sourceLanguage as GoogleLanguage,
      aiAnalyseResult.value.source,
      payload.partOfSpeech,
      aiAnalyseResult.value
    ),
    translation: translation,
    definitions: definitions,
    examples: examples,
    partOfSpeech: payload.partOfSpeech,
    ipa: sanitizeTranscript(aiAnalyseResult.value.transcript),
  };

  if (aiAnalyseResult.value.gender) {
    analysisItem.g = aiAnalyseResult.value.gender;
  }

  if (isAnalysisNumber(aiAnalyseResult.value.number)) {
    analysisItem.number = aiAnalyseResult.value.number;
  }

  if (aiAnalyseResult.value.pluralForm) {
    analysisItem.pluralForm = aiAnalyseResult.value.pluralForm;
  }

  if (aiAnalyseResult.value.pastTenses) {
    analysisItem.pastTenses = aiAnalyseResult.value.pastTenses;
  }

  if (aiAnalyseResult.value.presentTenses) {
    analysisItem.presentTenses = aiAnalyseResult.value.presentTenses;
  }

  if (isTense(aiAnalyseResult.value.tense)) {
    analysisItem.tense = aiAnalyseResult.value.tense;
  }

  return {
    success: true,
    value: analysisItem,
  };
};
