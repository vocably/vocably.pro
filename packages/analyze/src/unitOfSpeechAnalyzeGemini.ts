import {
  createUserContent,
  GenerateContentParameters,
  GoogleGenAI,
  HarmBlockThreshold,
  HarmCategory,
  ThinkingLevel,
} from '@google/genai';
import { parseJson } from '@vocably/api';
import { languageList, Result, resultify } from '@vocably/model';
import { timeout } from '@vocably/sulna';
import { isArray } from 'lodash-es';
import { config } from './config';
import { getTranscriptionName } from './getTranscriptionName';
import { isVerb } from './isVerb';
import { caseInsensitiveLanguages, genderLanguages } from './languageSettings';
import { secureSource } from './secureSource';
import {
  AiAnalysePayload,
  AiAnalysis,
  convertInternalToExternal,
  getFrequencyPrompt,
  getInflectionsPrompt,
  InflectionKey,
  isInternalAiAnalysis,
  sanitizeAiAnalyseResult,
} from './unitOfSpeechAnalyse';

type JsonSchemaProperty = {
  type: 'string' | 'boolean' | 'integer' | 'array' | 'object';
  description?: string;
  enum?: string[];
  items?: JsonSchemaProperty;
};

const inflectionSchemas: Record<InflectionKey, JsonSchemaProperty> = {
  tense: { type: 'string', enum: ['present', 'past', 'future'] },
  pastTenses: { type: 'string' },
  presentTenses: { type: 'string' },
  isIrregular: { type: 'boolean' },
  pluralForm: { type: 'string' },
};

const getGeminiGenerateContentParameters = ({
  source,
  partOfSpeech,
  sourceLanguage,
}: AiAnalysePayload): GenerateContentParameters => {
  const isTranscriptionNeeded = source.length <= 20;
  const languageName = languageList[sourceLanguage];

  const genders = genderLanguages[sourceLanguage] ?? [];

  const transcriptionType = getTranscriptionName(sourceLanguage);

  const securedSource = secureSource(source);

  const isCaseSensitive = !caseInsensitiveLanguages.includes(sourceLanguage);

  const inflections = getInflectionsPrompt({
    source,
    partOfSpeech,
    sourceLanguage,
  });

  const inflectionProperties: Partial<
    Record<InflectionKey, JsonSchemaProperty>
  > = Object.fromEntries(
    Object.entries(inflections).map(([key, description]) => [
      key,
      { ...inflectionSchemas[key as InflectionKey], description },
    ])
  );

  return {
    model: 'gemini-3.5-flash-lite',
    contents: createUserContent([source]),
    config: {
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
      systemInstruction: [
        `You are a language dictionary.`,
        `User provides a ${partOfSpeech} in ${languageName}.${
          isCaseSensitive
            ? ' The provided word can be in any case (e.g., uppercase, lowercase, or mixed case).'
            : ''
        }`,
        `Treat the input strictly as a ${partOfSpeech}`,
      ].filter((s) => s.length > 0),
      thinkingConfig: {
        thinkingLevel: ThinkingLevel.MINIMAL,
      },
      temperature: 0,
      responseMimeType: 'application/json',
      responseJsonSchema: {
        type: 'object',
        properties: {
          ...(isTranscriptionNeeded
            ? {
                transcript: {
                  type: 'string',
                  description: transcriptionType,
                },
              }
            : {}),
          headword: {
            type: 'string',
            description: `${partOfSpeech} provided by user.${
              isCaseSensitive
                ? ' Convert to lowercase, unless it is a word that strictly requires capitalization, then capitalize it.'
                : ''
            }`,
          },
          exists: {
            type: 'boolean',
            description: `does the ${partOfSpeech} "${securedSource}" exist in ${languageName}?`,
          },
          definitions: {
            type: 'array',
            description: `list of concise definitions of the ${partOfSpeech} "${securedSource}". Should be in ${languageName}.${
              isVerb(partOfSpeech)
                ? ` Consider tense of the provided ${partOfSpeech}.`
                : ''
            }`,
            items: { type: 'string' },
          },
          examples: {
            type: 'array',
            description: `list of extremely concise examples with "${securedSource}" used as ${partOfSpeech}. Omit translations.${
              isCaseSensitive && partOfSpeech.includes('noun')
                ? ' Uppercase when appropriate.'
                : ''
            }`,
            items: { type: 'string' },
          },
          lemma: {
            type: 'string',
            description: `lemma or infinitive of the provided ${partOfSpeech}`,
          },
          lemmaPos: {
            type: 'string',
            description: `part of speech of the lemma in English`,
          },
          synonyms: {
            type: 'array',
            description: `short list of ${partOfSpeech}s`,
            items: { type: 'string' },
          },
          number: {
            type: 'string',
            description: `plural or singular English only`,
            enum: ['singular', 'plural'],
          },
          frequency: {
            type: 'integer',
            description: getFrequencyPrompt(languageName, partOfSpeech),
          },
          ...inflectionProperties,
          ...(genders.length > 0
            ? {
                gender: {
                  type: 'string',
                  description: `gender of the provided word "${securedSource}"`,
                  enum: [...genders, 'other'],
                },
              }
            : {}),
        },
        required: [
          ...(isTranscriptionNeeded ? ['transcript'] : []),
          'headword',
          'exists',
          'definitions',
          'examples',
          'lemma',
          'lemmaPos',
          'synonyms',
          'number',
          'frequency',
          // pluralForm stays optional so that the model can omit it for the
          // words which have no plural form.
          ...Object.keys(inflections).filter((key) => key !== 'pluralForm'),
          ...(genders.length > 0 ? ['gender'] : []),
        ],
      },
    },
  };
};

export const getGeminiAnalyzeBatchItem = (payload: AiAnalysePayload) => {
  const params = getGeminiGenerateContentParameters(payload);

  if (!isArray(params?.config?.systemInstruction)) {
    throw new Error('Gemini system instruction is empty');
  }

  const systemInstructionText =
    params?.config?.systemInstruction.join('\n') ?? '';

  delete params?.config?.systemInstruction;
  delete params?.config?.safetySettings;

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

export const handleGeminiAnalyzeResponse = (
  text: string,
  { sourceLanguage, partOfSpeech }: AiAnalysePayload
): Result<AiAnalysis> => {
  const parseResult = parseJson(text);
  if (parseResult.success === false) {
    return parseResult;
  }

  if (!isInternalAiAnalysis(parseResult.value)) {
    return {
      success: false,
      reason: 'The Gemini request responded with the malformed response',
      extra: parseResult.value,
    };
  }

  return {
    success: true,
    value: sanitizeAiAnalyseResult(
      sourceLanguage,
      partOfSpeech,
      convertInternalToExternal(parseResult.value)
    ),
  };
};

export const geminiAnalyse = async (
  payload: AiAnalysePayload
): Promise<Result<AiAnalysis>> => {
  const genAI = new GoogleGenAI({
    apiKey: config.geminiApiKey,
  });

  const abortController = new AbortController();
  const abortSignal = abortController.signal;
  const params = getGeminiGenerateContentParameters(payload);
  params.config = {
    ...params.config,
    abortSignal,
  };

  const result = await resultify(
    timeout(genAI.models.generateContent(params), abortController, 4000),
    {
      reason: 'Unable to perform Gemini analyse.',
      extra: { payload },
    }
  );

  if (result.success === false) {
    return result;
  }

  if (
    result.value.promptFeedback &&
    result.value.promptFeedback.blockReason === 'PROHIBITED_CONTENT'
  ) {
    return {
      success: false,
      errorCode: 'PROHIBITED_CONTENT',
      reason:
        'The Gemini request responded with the prohibited content response',
      extra: result.value,
    };
  }

  if (!result.value.text) {
    return {
      success: false,
      reason: 'The Gemini request responded with the empty response',
      extra: result.value,
    };
  }

  return handleGeminiAnalyzeResponse(result.value.text, payload);
};
