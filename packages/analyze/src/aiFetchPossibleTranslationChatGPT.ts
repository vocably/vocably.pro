import { chatGptRequest, GPT_4O } from '@vocably/lambda-shared';
import { languageList, Result } from '@vocably/model';
import {
  Payload,
  sanitizeModelResponse,
  toValidTranslations,
  ValidTranslations,
} from './aiFetchPossibleTranslationsCommon';
import { secureSource } from './secureSource';

export const translateWithChatGpt = async (
  payload: Payload
): Promise<Result<ValidTranslations>> => {
  const source = secureSource(payload.source);
  const type = payload.inputType ?? 'word, phrase, or sentence';
  const prompt = [
    `Provide all the possible translations of the ${
      languageList[payload.targetLanguage]
    } ${type}`,
    `<input>${source}</input>`,
    `into ${languageList[payload.targetLanguage]}.`,
    `Response in JSON object with translations array. Each item:`,
    `- translation - the translation of the word/phrase`,
    `- partOfSpeech - the part of speech of the translation in English`,
    `- transcript - IPA`,
    `- lemma - lemma of translation`,
    `- lemmaPos - part of speech of lemma in English`,
  ].join('\n');

  const responseResult = await chatGptRequest({
    messages: [
      {
        role: 'system',
        content:
          'You are a smart language assistant. Only respond to questions about vocabulary and translations.',
      },
      { role: 'user', content: prompt },
    ],
    model: GPT_4O,
  });

  if (!responseResult.success) {
    return responseResult;
  }

  const sanitizeResult = sanitizeModelResponse(responseResult.value);

  if (!sanitizeResult.success) {
    return sanitizeResult;
  }

  return {
    success: true,
    value: toValidTranslations(payload, sanitizeResult.value),
  };
};
