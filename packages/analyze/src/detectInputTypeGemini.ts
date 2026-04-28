import { createUserContent, GoogleGenAI } from '@google/genai';
import { parseJson } from '@vocably/api';
import { inputTypes, languageList, Result, resultify } from '@vocably/model';
import { config } from './config';
import {
  DetectInputTypeAiPayload,
  InputAnalysis,
  isInputAnalysis,
} from './detectInputTypeAi';
import { timeout } from '@vocably/sulna';

export const detectInputTypeGemini = async ({
  source,
  language,
}: DetectInputTypeAiPayload): Promise<Result<InputAnalysis>> => {
  const genAI = new GoogleGenAI({
    apiKey: config.geminiApiKey,
  });

  const abortController = new AbortController();
  const abortSignal = abortController.signal;

  const result = await resultify(
    timeout(
      genAI.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: createUserContent([source]),
        config: {
          abortSignal,
          systemInstruction: [`Detect unit of speech type`],
          thinkingConfig: {
            thinkingBudget: 0, // Disables thinking
          },
          temperature: 0,
          responseMimeType: 'application/json',
          responseJsonSchema: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: inputTypes,
                description: 'Type of input',
              },
              isDirect: {
                type: 'boolean',
                description: `true if the input can be ${languageList[language]}`,
              },
            },
            required: ['type', 'isDirect'],
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

  if (!isInputAnalysis(jsonResult.value)) {
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
