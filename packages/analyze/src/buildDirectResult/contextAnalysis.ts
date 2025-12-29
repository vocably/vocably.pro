import {
  DetectedInputType,
  DirectAnalysis,
  GoogleLanguage,
  isSuccess,
  Result,
  Translation,
  ValidAnalysisItems,
} from '@vocably/model';
import {
  analyseAndTranslate,
  AnalyseAndTranslatePayload,
} from '../analyseAndTranslate';

import { trimSenselessArticle } from '@vocably/sulna';
import { translateFromContext } from '../translateFromContext';
import { translationToAnalysisItem } from '../translationToAnalyzeItem';

type Payload = {
  source: string;
  sourceLanguage: GoogleLanguage;
  targetLanguage: GoogleLanguage;
  context: string;
  inputType: DetectedInputType;
  isDirect: boolean;
};

export const directContextAnalysis = async ({
  source: rawSource,
  sourceLanguage,
  targetLanguage,
  context,
  inputType,
}: Payload): Promise<Result<DirectAnalysis>> => {
  const source = ['word', 'compound word'].includes(inputType)
    ? trimSenselessArticle(sourceLanguage, rawSource).trim()
    : rawSource.trim();

  const contextAnalysisResult = await translateFromContext({
    source,
    context,
    sourceLanguage,
    targetLanguage,
    inputType,
    isDirect: true,
  });

  if (contextAnalysisResult.success === false) {
    return contextAnalysisResult;
  }

  const translation: Translation = {
    source: rawSource,
    target: contextAnalysisResult.value.target,
    sourceLanguage: sourceLanguage,
    targetLanguage: targetLanguage,
    partOfSpeech: contextAnalysisResult.value.partOfSpeech,
    transcript: contextAnalysisResult.value.transcript,
    lemma: contextAnalysisResult.value.lemma,
    lemmaPos: contextAnalysisResult.value.lemmaPos,
    isDirect: true,
  };

  const analysePayloads: AnalyseAndTranslatePayload[] = [
    {
      source: contextAnalysisResult.value.source,
      partOfSpeech: contextAnalysisResult.value.partOfSpeech,
      sourceLanguage,
      targetLanguage,
    },
  ];

  if (
    contextAnalysisResult.value.lemma &&
    contextAnalysisResult.value.lemmaPos &&
    contextAnalysisResult.value.source.toLowerCase() !==
      contextAnalysisResult.value.lemma.toLowerCase()
  ) {
    analysePayloads.push({
      source: contextAnalysisResult.value.lemma,
      partOfSpeech: contextAnalysisResult.value.lemmaPos,
      sourceLanguage,
      targetLanguage,
    });
  }

  const analyseResults = (
    await Promise.all(
      analysePayloads.map((payload) => analyseAndTranslate(payload))
    )
  ).filter(isSuccess);

  const resultItems: ValidAnalysisItems = [
    translationToAnalysisItem(contextAnalysisResult.value),
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
      translation,
      items: resultItems,
      isDirect: true,
      detectedInputType: inputType,
      aiThinksItIs: contextAnalysisResult.value.target,
    },
  };
};

export const reverseContextAnalysis = async ({
  source: rawSource,
  sourceLanguage,
  targetLanguage,
  context,
  inputType,
}: Payload): Promise<Result<DirectAnalysis>> => {
  const source = rawSource.trim();

  const contextAnalysisResult = await translateFromContext({
    source,
    context,
    sourceLanguage,
    targetLanguage,
    inputType,
    isDirect: false,
  });

  if (contextAnalysisResult.success === false) {
    return contextAnalysisResult;
  }

  const translation: Translation = {
    source: source,
    target: contextAnalysisResult.value.source,
    sourceLanguage: sourceLanguage,
    targetLanguage: targetLanguage,
    partOfSpeech: contextAnalysisResult.value.partOfSpeech,
    transcript: contextAnalysisResult.value.transcript,
    lemma: contextAnalysisResult.value.lemma,
    lemmaPos: contextAnalysisResult.value.lemmaPos,
    isDirect: false,
  };

  const analysePayloads: AnalyseAndTranslatePayload[] = [
    {
      source: contextAnalysisResult.value.source,
      partOfSpeech: contextAnalysisResult.value.partOfSpeech,
      sourceLanguage,
      targetLanguage,
    },
  ];

  if (
    contextAnalysisResult.value.lemma &&
    contextAnalysisResult.value.lemmaPos &&
    contextAnalysisResult.value.source.toLowerCase() !==
      contextAnalysisResult.value.lemma.toLowerCase()
  ) {
    analysePayloads.push({
      source: contextAnalysisResult.value.lemma,
      partOfSpeech: contextAnalysisResult.value.lemmaPos,
      sourceLanguage,
      targetLanguage,
    });
  }

  const analyseResults = await Promise.all(
    analysePayloads.map((payload) => analyseAndTranslate(payload))
  );

  const resultItems: ValidAnalysisItems = [
    translationToAnalysisItem(contextAnalysisResult.value),
  ];

  if (analyseResults[0].success === true) {
    resultItems[0] = analyseResults[0].value;
  }

  analyseResults.slice(1).forEach((result) => {
    if (result.success === false) {
      return;
    }

    resultItems.push(result.value);
  });

  return {
    success: true,
    value: {
      source: source,
      targetLanguage: targetLanguage,
      sourceLanguage: sourceLanguage,
      translation,
      items: resultItems,
      isDirect: false,
      detectedInputType: inputType,
      aiThinksItIs: contextAnalysisResult.value.source,
    },
  };
};

export const contextAnalysis = async ({
  source,
  sourceLanguage,
  targetLanguage,
  context,
  isDirect,
  inputType,
}: Payload): Promise<Result<DirectAnalysis>> => {
  if (isDirect) {
    return directContextAnalysis({
      source,
      sourceLanguage,
      targetLanguage,
      context,
      inputType,
      isDirect,
    });
  } else {
    return reverseContextAnalysis({
      source,
      sourceLanguage,
      targetLanguage,
      context,
      inputType,
      isDirect,
    });
  }
};
