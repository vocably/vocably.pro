import { GoogleGenAI } from '@google/genai';
import { parseJson } from '@vocably/api';
import {
  isGoogleLanguage,
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
  preferredLanguage: preferredLanguageOption,
}: UnitOfSpeechGenerationPayload): Promise<
  Result<UnitOfSpeechGenerationMessageAssistant>
> => {
  const genAI = new GoogleGenAI({
    apiKey: config.geminiApiKey,
  });

  const preferredLanguage = isGoogleLanguage(preferredLanguageOption)
    ? languageList[preferredLanguageOption]
    : null;

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
          `You are a ${languageList[sourceLanguage]} dictionary`,
          `User asks you to generate the collection of ${languageList[sourceLanguage]} words or phrases`,
          `Interpret user request as the starting point for generation of collections of units of speech unless instructed otherwise`,
          `Avoid direct translations unless asked otherwise`,
          `Provide 1-30 items unless asked otherwise`,
          preferredLanguage
            ? `User speaks ${preferredLanguage}, but may contact you in other language.`
            : '',
        ].filter((s) => !!s),
        thinkingConfig: {
          thinkingBudget: 0, // Disables thinking
        },
        maxOutputTokens: 2500,
        temperature: 0,
        responseMimeType: 'application/json',
        responseJsonSchema: {
          type: 'object',
          properties: {
            modelResponse: {
              type: 'string',
              description: `An extremely concise response. No filler, no praise, no agreement.${
                preferredLanguage
                  ? ` Respond in ${preferredLanguage} unless user contacted you in other language.`
                  : ''
              }`,
            },
            unitsOfSpeech: {
              type: 'array',
              description: 'An array of units of speech',
              items: {
                type: 'object',
                properties: {
                  headword: { type: 'string' },
                  partOfSpeech: {
                    type: 'string',
                    description: 'Part of speech in English',
                  },
                },
                required: ['headword', 'partOfSpeech'],
              },
            },
          },
          required: ['modelResponse', 'unitsOfSpeech'],
        },
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

  if (!isArray(parseResult.value?.unitsOfSpeech)) {
    return {
      success: false,
      reason: 'Has no units of speech',
      extra: { result: parseResult.value },
    };
  }

  const validUnitsOfSpeech =
    parseResult.value.unitsOfSpeech.filter(isUnitOfSpeech);

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
      text: parseResult.value['modelResponse'] ?? '',
      unitsOfSpeech: validUnitsOfSpeech,
    },
  };
};
