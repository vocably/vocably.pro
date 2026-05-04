import {
  DirectAnalysis,
  DirectAnalyzePayload,
  Result,
  unitOfSpeechTypes,
} from '@vocably/model';
import { isString } from 'lodash-es';
import { contextAnalysis } from './buildDirectResult/contextAnalysis';
import { reverseAnalysis } from './buildDirectResult/reverseAnalysis';
import { sentenceAnalysis } from './buildDirectResult/sentenceAnalysis';
import { unitOfSpeechAnalysis } from './buildDirectResult/unitOfSpeechAnalysis';
import { detectInputTypeAi } from './detectInputTypeAi';
import { sanitizePayload } from './sanitizePayload';
import { trimArticle } from '@vocably/sulna';

export const buildDirectResult = async (
  rawPayload: DirectAnalyzePayload
): Promise<Result<DirectAnalysis>> => {
  const payload = sanitizePayload(rawPayload);

  const detectedTypeResult = await detectInputTypeAi({
    language: payload.sourceLanguage,
    source: trimArticle(payload.sourceLanguage, payload.source).source,
  });

  if (!detectedTypeResult.success) {
    return detectedTypeResult;
  }

  if (
    detectedTypeResult.value.isDirect &&
    detectedTypeResult.value.type === 'sentence'
  ) {
    return sentenceAnalysis({
      ...payload,
      inputType: detectedTypeResult.value.type,
      isDirect: detectedTypeResult.value.isDirect,
    });
  }

  if (
    isString(payload.context) &&
    payload.context.length > payload.source.length
  ) {
    return contextAnalysis({
      source: payload.source,
      context: payload.context,
      sourceLanguage: payload.sourceLanguage,
      targetLanguage: payload.targetLanguage,
      isDirect: detectedTypeResult.value.isDirect,
      inputType: detectedTypeResult.value.type,
    });
  }

  if (detectedTypeResult.value.isDirect === false) {
    return reverseAnalysis({
      payload: {
        target: payload.source,
        sourceLanguage: payload.sourceLanguage,
        targetLanguage: payload.targetLanguage,
      },
      inputAnalysis: detectedTypeResult.value,
    });
  }

  if (unitOfSpeechTypes.includes(detectedTypeResult.value.type)) {
    return unitOfSpeechAnalysis({
      ...payload,
      isDirect: detectedTypeResult.value.isDirect,
      inputType: detectedTypeResult.value.type,
    });
  }

  return sentenceAnalysis({
    ...payload,
    inputType: detectedTypeResult.value.type,
    isDirect: detectedTypeResult.value.isDirect,
  });
};
