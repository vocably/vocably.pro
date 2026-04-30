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
import { aiAnalyse, AiAnalysis } from './aiUnitOfSpeechAnalyse';
import { translateUnitOfSpeech } from './translateUnitOfSpeech';

export type AnalyseAndTranslatePayload = {
  source: string;
  sourceLanguage: GoogleLanguage;
  targetLanguage: GoogleLanguage;
  partOfSpeech: string;
};

type AnalysisToItemPayload = {
  sourceLanguage: GoogleLanguage;
  partOfSpeech: string;
  aiAnalysis: AiAnalysis;
  translations: string[];
};
export const aiAnalysisToItem = ({
  sourceLanguage,
  aiAnalysis,
  partOfSpeech,
  translations,
}: AnalysisToItemPayload): AnalysisItem => {
  const analysisItem: AnalysisItem = {
    source: addArticle(
      sourceLanguage,
      aiAnalysis.source,
      partOfSpeech,
      aiAnalysis
    ),
    translation: translations.join(', '),
    definitions: aiAnalysis.definitions,
    examples: aiAnalysis.examples,
    partOfSpeech,
    ipa: sanitizeTranscript(aiAnalysis.transcript),
  };

  if (aiAnalysis.gender) {
    analysisItem.g = aiAnalysis.gender;
  }

  if (isAnalysisNumber(aiAnalysis.number)) {
    analysisItem.number = aiAnalysis.number;
  }

  if (aiAnalysis.pluralForm) {
    analysisItem.pluralForm = aiAnalysis.pluralForm;
  }

  if (aiAnalysis.pastTenses) {
    analysisItem.pastTenses = aiAnalysis.pastTenses;
  }

  if (aiAnalysis.presentTenses) {
    analysisItem.presentTenses = aiAnalysis.presentTenses;
  }

  if (isTense(aiAnalysis.tense)) {
    analysisItem.tense = aiAnalysis.tense;
  }

  return analysisItem;
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

  let translations: string[] = [];

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

    translations = translationResult.value;
  }

  return {
    success: true,
    value: aiAnalysisToItem({
      sourceLanguage: payload.sourceLanguage,
      partOfSpeech: payload.partOfSpeech,
      aiAnalysis: aiAnalyseResult.value,
      translations,
    }),
  };
};
