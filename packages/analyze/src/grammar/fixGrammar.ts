import { createUserContent, GoogleGenAI } from '@google/genai';
import { parseJson } from '@vocably/api';
import {
  FixGrammarPayload,
  FixGrammarResponse,
  isFixGrammarResponse,
  languageList,
  Result,
  resultify,
} from '@vocably/model';
import { config } from '../config';
import { timeout } from '@vocably/sulna';

export const fixGrammar = async ({
  text,
  language,
  context,
  explanationLanguage = language,
}: FixGrammarPayload): Promise<Result<FixGrammarResponse>> => {
  const genAI = new GoogleGenAI({
    apiKey: config.geminiApiKey,
  });

  const abortController = new AbortController();
  const abortSignal = abortController.signal;

  const result = await resultify(
    timeout(
      genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: createUserContent([
          `text: ${text}`,
          `context: ${context ?? ''}`,
        ]),
        config: {
          abortSignal,
          systemInstruction: [
            `You are a teacher of ${languageList[language]}`,
            `User provides a text and an optional context`,
            `Fix the text according to ${languageList[language]} grammar rules and explain the reasoning`,
          ],
          thinkingConfig: {
            thinkingBudget: 0, // Disables thinking
          },
          temperature: 0,
          responseMimeType: 'application/json',
          responseJsonSchema: {
            type: 'object',
            properties: {
              text: {
                type: 'string',
                description: 'Corrected text',
              },
              explanation: {
                type: 'string',
                description: `A markdown concise reasoning for the changes. Explained in ${languageList[explanationLanguage]}. Don't repeat the provided sentence.`,
              },
              isCorrect: {
                type: 'boolean',
                description: `true if the text is correct`,
              },
            },
            required: ['text', 'explanation', 'isCorrect'],
          },
        },
      }),
      abortController,
      3000
    ),
    {
      reason: 'Unable to perform Gemini translation.',
    }
  );

  if (result.success === false) {
    return result;
  }

  if (!result.value.text) {
    return {
      success: false,
      reason: 'No text returned from Gemini',
    };
  }

  const jsonResult = parseJson(result.value.text);

  if (!jsonResult.success) {
    return jsonResult;
  }

  if (!isFixGrammarResponse(jsonResult.value)) {
    return {
      success: false,
      reason:
        'Unsupported input type returned from Gemini: ' + result.value.text,
    };
  }

  return {
    success: true,
    value: jsonResult.value,
  };
};
