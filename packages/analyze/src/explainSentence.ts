import { createUserContent, GoogleGenAI } from '@google/genai';
import { chatGptRequest, GPT_4O } from '@vocably/lambda-shared';
import {
  ExplainPayload,
  languageList,
  Result,
  resultify,
} from '@vocably/model';
import { config } from './config';
import { fallback } from './fallback';

type Explanation = {
  explanation: string;
};

export const explainGemini = async ({
  targetLanguage,
  sourceLanguage,
  source,
}: ExplainPayload): Promise<Result<Explanation>> => {
  const genAI = new GoogleGenAI({
    apiKey: config.geminiApiKey,
  });

  const result = await resultify(
    genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: createUserContent([source]),
      config: {
        systemInstruction: [
          `Shortly explain what to pay attention to for proper understanding of the submitted ${languageList[sourceLanguage]} sentence`,
          `Provide explanation in ${languageList[targetLanguage]}'`,
          `Use bullet points.`,
          `Avoid introduction.`,
        ],
        thinkingConfig: {
          thinkingBudget: 0, // Disables thinking
        },
        temperature: 0,
        responseMimeType: 'text/plain',
      },
    }),
    {
      reason: 'Unable to perform Gemini translation.',
    }
  );

  if (!result.success) {
    return result;
  }

  return {
    success: true,
    value: {
      explanation: result.value.text ?? '',
    },
  };
};

export const explainGpt = async ({
  targetLanguage,
  sourceLanguage,
  source,
}: ExplainPayload): Promise<Result<Explanation>> => {
  const responseResult = await chatGptRequest({
    messages: [
      {
        role: 'system',
        content: `You are a helpful and knowledgeable language tutor. A user is learning ${languageList[sourceLanguage]}.`,
      },
      {
        role: 'system',
        content: [
          `Shortly explain what to pay attention to for proper understanding of the submitted sentence.`,
          `Provide explanation in ${languageList[targetLanguage]}'`,
          `Avoid introduction.`,
        ].join('\n'),
      },
      {
        role: 'user',
        content: source,
      },
    ],
    responseFormat: {
      type: 'text',
    },
    model: GPT_4O,
  });

  if (responseResult.success === false) {
    return responseResult;
  }

  return {
    success: true,
    value: {
      explanation: responseResult.value,
    },
  };
};

export const explainSentence = async (
  payload: ExplainPayload
): Promise<Result<Explanation>> => {
  return fallback(explainGemini(payload), () => explainGpt(payload));
};
