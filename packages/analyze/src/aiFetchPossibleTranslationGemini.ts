import {
  createUserContent,
  GenerateContentParameters,
  GoogleGenAI,
  ThinkingLevel,
} from '@google/genai';
import { parseJson } from '@vocably/api';
import {
  DetectedInputType,
  languageList,
  Result,
  resultify,
} from '@vocably/model';
import { isArray } from 'lodash-es';
import {
  Payload,
  sanitizeModelResponse,
  toValidTranslations,
  ValidTranslations,
} from './aiFetchPossibleTranslationsCommon';
import { config } from './config';
import { getTranscriptionName } from './getTranscriptionName';
import { secureSource } from './secureSource';

const isCompound = (
  detectedInputType: DetectedInputType | undefined
): boolean => {
  return ['sentence'].includes(detectedInputType as DetectedInputType);
};

export const getGeminiTranslateGenerateContentParameters = (
  payload: Payload
): GenerateContentParameters => {
  const source = secureSource(payload.source);

  const type = payload.inputType ?? 'word, phrase, or sentence';

  let responseSchema: any = {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        translation: {
          type: 'string',
          description: `the translation of the ${type} into ${
            languageList[payload.targetLanguage]
          }`,
        },
      },
    },
  };

  if (!isCompound(payload.inputType)) {
    responseSchema = {
      ...responseSchema,
      items: {
        ...responseSchema.items,
        properties: {
          ...responseSchema.items.properties,
          partOfSpeech: {
            type: 'string',
            description: 'the part of speech of the translation in English',
          },
          transcript: {
            type: 'string',
            description: getTranscriptionName(payload.targetLanguage),
          },
          lemma: { type: 'string', description: 'lemma of translation' },
          lemmaPos: {
            type: 'string',
            description: 'part of speech of lemma in English',
          },
        },
      },
    };
  }

  return {
    model: 'gemini-3.5-flash-lite',
    contents: createUserContent(source),
    config: {
      systemInstruction: [
        `User provides a ${type} in any language, but most likely in ${
          languageList[payload.sourceLanguage]
        }.`,
        `Provide possible translations into ${
          languageList[payload.targetLanguage]
        } and only in ${languageList[payload.targetLanguage]}.`,
        `Include the common synonyms and the translations of each common meaning, most common first. Keep the part of speech of the input.`,
        `Avoid splitting. Don't split. Translate it as single unit of speech.`,
      ],
      thinkingConfig: {
        thinkingLevel: ThinkingLevel.MINIMAL,
      },
      responseMimeType: 'application/json',
      responseJsonSchema: responseSchema,
    },
  };
};

export const getGeminiTranslateBatchItem = (payload: Payload) => {
  const params = getGeminiTranslateGenerateContentParameters(payload);

  if (!isArray(params?.config?.systemInstruction)) {
    throw new Error('Gemini system instruction is empty');
  }

  const systemInstructionText =
    params?.config?.systemInstruction.join('\n') ?? '';

  delete params?.config?.systemInstruction;

  return {
    key: JSON.stringify(payload),
    request: {
      model: `models/${params.model}`,
      contents: params.contents,
      generation_config: {
        ...params.config,
      },
      system_instruction: {
        parts: [
          {
            text: systemInstructionText,
          },
        ],
      },
    },
  };
};

export const handleGeminiTranslateResponse = (
  text: string,
  payload: Payload
): Result<ValidTranslations> => {
  const parseResult = parseJson(text);

  if (!parseResult.success) {
    return parseResult;
  }

  const sanitizeResult = sanitizeModelResponse(parseResult.value);

  if (!sanitizeResult.success) {
    return sanitizeResult;
  }

  return {
    success: true,
    value: toValidTranslations(payload, sanitizeResult.value),
  };
};

export const translateWithGemini = async (
  payload: Payload
): Promise<Result<ValidTranslations>> => {
  const genAI = new GoogleGenAI({
    apiKey: config.geminiApiKey,
  });

  const result = await resultify(
    genAI.models.generateContent(
      getGeminiTranslateGenerateContentParameters(payload)
    ),
    {
      reason: 'translateWithGemini: Unable to perform Gemini translation.',
      extra: payload,
    }
  );

  if (result.success === false) {
    return result;
  }

  return handleGeminiTranslateResponse(result.value.text ?? '', payload);
};
