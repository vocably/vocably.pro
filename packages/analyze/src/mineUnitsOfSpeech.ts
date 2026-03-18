import { createUserContent, GoogleGenAI } from '@google/genai';
import { parseJson } from '@vocably/api';
import {
  ExplainPayload,
  isUnitOfSpeech,
  languageList,
  Result,
  resultify,
  UnitOfSpeech,
} from '@vocably/model';
import { isArray } from 'lodash-es';
import { config } from './config';

export const mineUnitsOfSpeech = async ({
  sourceLanguage,
  source,
}: ExplainPayload): Promise<Result<UnitOfSpeech[]>> => {
  const genAI = new GoogleGenAI({
    apiKey: config.geminiApiKey,
  });

  const result = await resultify(
    genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: createUserContent([source]),
      config: {
        systemInstruction: [
          `You are a ${languageList[sourceLanguage]} language expert.`,
          `Extract all meaningful units of speech from the submitted ${languageList[sourceLanguage]} sentence.`,
          `Normalize each unit: nouns must be in singular form, verbs must be in infinitive form.`,
          `Include idioms and phrasal verbs that appear in or can be derived from the sentence.`,
          `The partOfSpeech field must be in English.`,
        ],
        thinkingConfig: {
          thinkingBudget: 0,
        },
        temperature: 0,
        maxOutputTokens: 2500,
        responseMimeType: 'application/json',
        responseJsonSchema: {
          type: 'object',
          properties: {
            unitsOfSpeech: {
              type: 'array',
              description: 'An array of units of speech',
              items: {
                type: 'object',
                properties: {
                  headword: {
                    type: 'string',
                    description:
                      'The normalized form of the unit of speech (singular for nouns, infinitive for verbs)',
                  },
                  partOfSpeech: {
                    type: 'string',
                    description:
                      'Part of speech in English (noun, verb, adjective, adverb, idiom, phrasal verb, etc.)',
                  },
                },
                required: ['headword', 'partOfSpeech'],
              },
            },
          },
          required: ['unitsOfSpeech'],
        },
      },
    }),
    {
      reason: 'Unable to perform Gemini units of speech mining.',
    }
  );

  if (!result.success) {
    return result;
  }

  const parseResult = parseJson(result.value.text ?? '');

  if (!parseResult.success) {
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

  if (validUnitsOfSpeech.length === 0) {
    return {
      success: false,
      reason: 'The provided result does not contain valid units of speech',
      extra: { result: parseResult.value },
    };
  }

  return {
    success: true,
    value: validUnitsOfSpeech,
  };
};
