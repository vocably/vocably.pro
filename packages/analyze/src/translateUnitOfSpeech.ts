import {
  createUserContent,
  GenerateContentParameters,
  GoogleGenAI,
} from '@google/genai';
import { parseJson } from '@vocably/api';
import {
  chatGptRequest,
  GPT_4O,
  nodeFetchS3File,
  nodePutS3File,
} from '@vocably/lambda-shared';
import {
  ChatGPTLanguage,
  languageList,
  Result,
  resultify,
} from '@vocably/model';
import { trimArticle } from '@vocably/sulna';
import { first, isArray, isObject, uniq } from 'lodash-es';
import { config } from './config';
import { fallback, FallbackResult } from './fallback';
import { timeout } from './timeout';
import { validateSource } from './validateSource';

type Payload = {
  sourceLanguage: ChatGPTLanguage;
  targetLanguage: ChatGPTLanguage;
  partOfSpeech: string;
  source: string;
  definitions?: string[];
  number?: string;
};

type AtLeastOne<T> = {
  [K in keyof T]: Pick<T, K> & Partial<T>;
}[keyof T];

type AiTranslation = AtLeastOne<Record<string, string>> | string;

const isAiTranslation = (translation: any): translation is AiTranslation => {
  if (typeof translation === 'string') {
    return true;
  }

  if (!isObject(translation)) {
    return false;
  }

  const entries = Object.entries(translation);

  if (entries.length !== 1) {
    return false;
  }

  if (typeof entries[0][1] !== 'string') {
    return false;
  }

  return true;
};

/**
 * Gemini is expected to return translations as an array of strings,
 * but sometimes it returns an array of objects with a single `translation` field.
 */
const mapGeminiTranslation = (translation: AiTranslation): string => {
  if (!isObject(translation)) {
    return translation;
  }

  const translationValue = first(Object.values(translation));

  if (!translationValue) {
    return '';
  }

  return translationValue;
};

export const getExpectedNumberOfTranslations = (
  definitions: string[]
): number => {
  if (definitions.length <= 1) {
    return 2;
  }

  return definitions.length;
};

const getGeminiGenerationContentParams = ({
  sourceLanguage,
  targetLanguage,
  source,
  partOfSpeech,
  definitions = [],
  number,
}: Payload): GenerateContentParameters => {
  const safeSourceLanguage = languageList[sourceLanguage];
  const safeTargetLanguage = languageList[targetLanguage];

  const expectedNumberOfTranslations =
    getExpectedNumberOfTranslations(definitions);

  return {
    model: 'gemini-2.5-flash',
    contents: createUserContent([source, ...definitions]),
    config: {
      systemInstruction: [
        `You are ${safeSourceLanguage}-${safeTargetLanguage} dictionary`,
        `User provides ${safeSourceLanguage} ${partOfSpeech}${
          definitions?.length > 0 ? ' and its definitions' : ''
        }.`,
        `Give up to ${expectedNumberOfTranslations} relevant translations into ${safeTargetLanguage}${
          definitions?.length > 0 ? ' in the context of definitions' : ''
        }.${
          expectedNumberOfTranslations === 2
            ? ' Only include a second if it is a common, high-frequency usage.'
            : ''
        }`,
        `Respond in JSON array with each translation on a separate line`,
        partOfSpeech.includes('verb')
          ? `Consider tense of the provided ${partOfSpeech}`
          : '',
        number === 'plural' && partOfSpeech === 'noun' ? 'This is plural.' : '',
        `Omit explanations`,
        `Sort results by commonality`,
      ],
      thinkingConfig: {
        thinkingBudget: 0, // Disables thinking
      },
      temperature: 0,
      responseMimeType: 'application/json',
      responseJsonSchema: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
    },
  };
};

export const getGeminiTranslationBatchItem = (payload: Payload) => {
  const params = getGeminiGenerationContentParams(payload);

  if (!isArray(params?.config?.systemInstruction)) {
    throw new Error('Gemini system instruction is empty');
  }

  const systemInstructionText =
    params?.config?.systemInstruction.join('\n') ?? '';

  delete params?.config?.systemInstruction;
  delete params?.config?.safetySettings;

  return {
    key: JSON.stringify({
      sourceLanguage: payload.sourceLanguage,
      targetLanguage: payload.targetLanguage,
      partOfSpeech: payload.partOfSpeech,
      source: payload.source,
    }),
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

export const handleGeminiTranslationResponse = (
  text: string
): Result<string[]> => {
  const parseResult = parseJson(text ?? '');
  if (!parseResult.success) {
    return parseResult;
  }

  if (
    !isArray(parseResult.value) ||
    !parseResult.value.every(isAiTranslation)
  ) {
    return {
      success: false,
      reason: `The provided result is not an array of valid AI translations.`,
      extra: {
        result: text,
      },
    };
  }

  const translations = uniq(
    parseResult.value
      .map(mapGeminiTranslation)
      .map((r) => r.toString().trim())
      .filter((r) => !!r)
  ) as string[];

  if (translations.length === 0) {
    return {
      success: false,
      reason: `The translations list is empty`,
      extra: {
        result: text,
      },
    };
  }

  return {
    success: true,
    value: translations.length > 10 ? translations.slice(0, 5) : translations,
  };
};

export const translateUnitOfSpeechGemini = async (
  payload: Payload
): Promise<Result<string[]>> => {
  const genAI = new GoogleGenAI({
    apiKey: config.geminiApiKey,
  });

  const abortController = new AbortController();
  const abortSignal = abortController.signal;

  const params = getGeminiGenerationContentParams(payload);
  params.config = {
    ...params.config,
    abortSignal,
  };

  const result = await resultify(
    timeout(genAI.models.generateContent(params), abortController, 4000),
    {
      reason: 'Unable to perform Gemini translation.',
    }
  );

  if (!result.success) {
    return result;
  }

  return handleGeminiTranslationResponse(result.value.text ?? '');
};

export const translateUnitOfSpeechChatGpt = async ({
  sourceLanguage,
  targetLanguage,
  source,
  partOfSpeech,
  definitions = [],
  number,
}: Payload): Promise<Result<string[]>> => {
  const safeSourceLanguage = languageList[sourceLanguage];
  const safeTargetLanguage = languageList[targetLanguage];

  const result = await chatGptRequest({
    messages: [
      {
        role: 'system',
        content: [
          `You are ${safeSourceLanguage}-${safeTargetLanguage} dictionary`,
          `User provides ${safeSourceLanguage} ${partOfSpeech}${
            definitions?.length > 0 ? ' and its definitions' : ''
          }.`,
          `Give up to ${getExpectedNumberOfTranslations(
            definitions
          )} relevant translations into ${safeTargetLanguage}${
            definitions?.length > 0 ? ' in the context of definitions' : ''
          }.`,
          `Only respond in text format with each translation on a separate line`,
          partOfSpeech.includes('verb')
            ? `Consider tense of the provided ${partOfSpeech}`
            : '',
          number === 'plural' && partOfSpeech === 'noun'
            ? 'This is plural'
            : '',
          `Omit explanations`,
          `Sort results by commonality`,
        ].join('\n'),
      },
      { role: 'user', content: source },
      { role: 'user', content: definitions.join('\n') },
    ],
    model: GPT_4O,
    responseFormat: {
      type: 'text',
    },
  });

  if (result.success === false) {
    return result;
  }

  if (!result.success) {
    return result;
  }

  const translations = uniq(
    result.value
      .split('\n')
      .map((s: string) => s.trim().replace(/^-/, '').trim().toLowerCase())
      .map((pos: string) => {
        if (/substantiv[^,]*/i.test(pos)) {
          return 'noun';
        }

        return pos;
      })
  ) as string[];

  return {
    success: true,
    value: translations,
  };
};

export const translateUnitOfSpeechNoCache = async (
  payload: Payload
): Promise<FallbackResult<string[]>> => {
  const trimmedPayload = {
    ...payload,
    source: trimArticle(payload.sourceLanguage, payload.source).source,
  };

  return fallback(translateUnitOfSpeechGemini(trimmedPayload), () =>
    translateUnitOfSpeechChatGpt(trimmedPayload)
  );
};

export const getUnitOfSpeechTranslationFileName = (
  payload: Payload
): string => {
  return `${payload.sourceLanguage.toLowerCase()}/translations/${payload.source
    .toLowerCase()
    .replace(/\//g, '-')}/${payload.partOfSpeech
    .toLowerCase()
    .replace(/\//g, '-')}/${payload.targetLanguage.toLowerCase()}.txt`;
};

export const translateUnitOfSpeech = async (
  payload: Payload
): Promise<Result<string[]>> => {
  const isValidSource = validateSource({
    source: payload.source,
    partOfSpeech: payload.partOfSpeech,
  });
  const fileName = getUnitOfSpeechTranslationFileName(payload);
  const s3FetchResult = await nodeFetchS3File(
    config.unitsOfSpeechBucket,
    fileName
  );

  if (s3FetchResult.success && s3FetchResult.value !== null) {
    const translations = s3FetchResult.value.split('\n').filter((s) => !!s);

    return {
      success: true,
      value: translations,
    };
  }

  const translationResult = await translateUnitOfSpeechNoCache(payload);

  if (!translationResult.success) {
    return translationResult;
  }

  if (isValidSource && !translationResult.fallenBack) {
    const putResult = await nodePutS3File(
      config.unitsOfSpeechBucket,
      fileName,
      translationResult.value.join('\n')
    );

    if (!putResult.success) {
      console.error('Failed to put the translation result to S3', putResult);
    }
  }

  return translationResult;
};
