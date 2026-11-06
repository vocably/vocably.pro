import {
  createUserContent,
  GenerateContentParameters,
  GoogleGenAI,
  ThinkingLevel,
} from '@google/genai';
import { parseJson } from '@vocably/api';
import {
  chatGptRequest,
  GPT_4O,
  nodeFetchS3File,
  nodePutS3File,
} from '@vocably/lambda-shared';
import {
  DetectedInputType,
  GoogleLanguage,
  isTranslation,
  languageList,
  Result,
  resultify,
  Translation,
} from '@vocably/model';
import { isSafeObject, sanitizeTranscript, trimArticle } from '@vocably/sulna';
import { get, isArray, uniqBy } from 'lodash-es';
import { config } from './config';
import { fallback } from './fallback';
import { getTranscriptionName } from './getTranscriptionName';
import { sanitizePartOfSpeech } from './sanitizePartOfSpeech';
import { secureSource } from './secureSource';

type Payload = {
  source: string;
  sourceLanguage: GoogleLanguage;
  targetLanguage: GoogleLanguage;
  inputType?: DetectedInputType;
};

type AiTranslationVariant = {
  translation: string;
  partOfSpeech?: string;
  transcript?: string;
  lemma?: string;
  lemmaPos?: string;
};

type AiTranslationResult = [AiTranslationVariant, ...AiTranslationVariant[]];
type ValidTranslations = [Translation, ...Translation[]];

export const truncateText = (text: string, length: number): string => {
  return text.replace(/[<>]/gm, '').slice(0, length);
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

const sanitizeModelResponse = (data: any): Result<AiTranslationResult> => {
  const translationCandidates = isArray(data)
    ? data
    : get(data, 'translations');

  if (!isArray(translationCandidates)) {
    return {
      success: false,
      reason: `The provided result is not an array`,
      extra: { data },
    };
  }

  const translationVariants = translationCandidates
    .filter(isTranslationVariant)
    .slice(0, 6);

  if (translationVariants.length === 0) {
    return {
      success: false,
      reason: `There are no valid translation variants`,
      extra: { data },
    };
  }

  return {
    success: true,
    value: [translationVariants[0], ...translationVariants.slice(1)],
  };
};

const isTranslationVariant = (data: any): data is AiTranslationVariant => {
  return (
    isSafeObject(data) &&
    typeof data['translation'] === 'string' &&
    (!data['partOfSpeech'] || typeof data['partOfSpeech'] === 'string') &&
    (!data['lemma'] || typeof data['lemma'] === 'string') &&
    (!data['lemmaPos'] || typeof data['lemmaPos'] === 'string')
  );
};

const sanitizeTranslationVariant =
  (payload: Payload) =>
  (translationVariant: AiTranslationVariant): AiTranslationVariant => {
    if (
      payload.targetLanguage === 'en' &&
      translationVariant.partOfSpeech === 'verb'
    ) {
      return {
        ...translationVariant,
        translation: translationVariant.translation.replace(/to /i, ''),
        transcript: (translationVariant.transcript ?? '').replace(/tu /i, ''),
      };
    }

    return translationVariant;
  };

const isCompound = (
  detectedInputType: DetectedInputType | undefined
): boolean => {
  return ['sentence'].includes(detectedInputType as DetectedInputType);
};

const toValidTranslations = (
  payload: Payload,
  translationVariants: AiTranslationResult
): ValidTranslations => {
  const translations = uniqBy(
    translationVariants
      .map(sanitizeTranslationVariant(payload))
      .map((translationVariant) => ({
        source: payload.source,
        sourceLanguage: payload.sourceLanguage,
        targetLanguage: payload.targetLanguage,
        target: translationVariant.translation,
        partOfSpeech: sanitizePartOfSpeech(
          translationVariant.partOfSpeech ?? payload.inputType ?? ''
        ),
        transcript: sanitizeTranscript(translationVariant.transcript ?? ''),
        lemma: translationVariant.lemma,
        lemmaPos: sanitizePartOfSpeech(translationVariant.lemmaPos ?? ''),
      }))
      .map((translationVariant) => {
        return {
          ...translationVariant,
          target: trimArticle(payload.targetLanguage, translationVariant.target)
            .source,
        };
      }),
    (itemToCompare) => {
      return itemToCompare.target + itemToCompare.partOfSpeech;
    }
  );

  return [translations[0], ...translations.slice(1)];
};

export const aiFetchPossibleTranslations = async (
  payload: Payload
): Promise<Result<ValidTranslations>> => {
  return fallback(translateWithGemini(payload), () =>
    translateWithChatGpt(payload)
  );
};

const getTranslationsCacheFileName = ({
  source,
  sourceLanguage,
  targetLanguage,
  inputType,
}: Payload): string => {
  const inputTypePart = inputType ? `/${inputType}` : '';

  return `_reverse-translations/${targetLanguage.toLowerCase()}/${sourceLanguage.toLocaleLowerCase()}/${source
    .toLowerCase()
    .replace(/\//g, '-')}${inputTypePart}.json`;
};

const isValidTranslations = (data: any): data is ValidTranslations => {
  return isArray(data) && data.length > 0 && data.every(isTranslation);
};

export const aiFetchPossibleTranslationsCached = async (
  payload: Payload
): Promise<Result<ValidTranslations>> => {
  const fileName = getTranslationsCacheFileName(payload);

  const s3FetchResult = await nodeFetchS3File(
    config.unitsOfSpeechBucket,
    fileName
  );

  if (s3FetchResult.success && s3FetchResult.value !== null) {
    const parseResult = parseJson(s3FetchResult.value);

    if (parseResult.success && isValidTranslations(parseResult.value)) {
      return {
        success: true,
        value: parseResult.value,
      };
    }
  }

  const result = await aiFetchPossibleTranslations(payload);

  if (!result.success) {
    return result;
  }

  if (payload.inputType !== 'sentence') {
    await nodePutS3File(
      config.unitsOfSpeechBucket,
      fileName,
      JSON.stringify(result.value, null, 2)
    );
  }

  return result;
};
