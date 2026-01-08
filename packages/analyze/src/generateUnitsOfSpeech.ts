import { GoogleGenAI } from '@google/genai';
import { parseJson } from '@vocably/api';
import {
  isUnitOfSpeech,
  languageList,
  Result,
  resultify,
  UnitOfSpeechGenerationMessageAssistant,
  UnitOfSpeechGenerationPayload,
} from '@vocably/model';
import { isArray } from 'lodash-es';
import { config } from './config';

export const generateUnitsOfSpeech = async ({
  sourceLanguage,
  messages,
}: UnitOfSpeechGenerationPayload): Promise<
  Result<UnitOfSpeechGenerationMessageAssistant>
> => {
  const genAI = new GoogleGenAI({
    apiKey: config.geminiApiKey,
  });

  const result = await resultify(
    genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: messages.map((message) => {
        if (message.role === 'user') {
          return {
            role: 'user',
            parts: [
              {
                text: message.text,
              },
            ],
          };
        } else {
          return {
            role: 'model',
            parts: message.unitsOfSpeech.map((unitOfSpeech) => ({
              text: JSON.stringify(unitOfSpeech),
            })),
          };
        }
      }),
      config: {
        systemInstruction: [
          `You are a ${languageList[sourceLanguage]} dictionary.`,
          `User asks you to generate the collection of ${languageList[sourceLanguage]} words or phrases.`,
          `Always response with JSON array. Each item is an object with the following fields:`,
          `-headword - a word or phrase`,
          `-partOfSpeech - part of speech of the word or phrase in English`,
        ],
        thinkingConfig: {
          thinkingBudget: 0, // Disables thinking
        },
        temperature: 0,
        responseMimeType: 'application/json',
      },
    }),
    {
      reason: 'Unable to perform Gemini units of speech generation.',
    }
  );

  if (result.success === false) {
    return result;
  }

  const parseResult = parseJson(result.value.text ?? '');

  if (parseResult.success === false) {
    return parseResult;
  }

  if (!isArray(parseResult.value)) {
    return {
      success: false,
      reason: 'The provided result is not an array',
      extra: { result: parseResult.value },
    };
  }

  const validUnitsOfSpeech = parseResult.value.filter(isUnitOfSpeech);

  if (!validUnitsOfSpeech) {
    return {
      success: false,
      reason: 'The provided result does not contain valid units of speech',
      extra: { result: parseResult.value },
    };
  }

  return {
    success: true,
    value: {
      role: 'assistant',
      unitsOfSpeech: validUnitsOfSpeech,
    },
  };
};
