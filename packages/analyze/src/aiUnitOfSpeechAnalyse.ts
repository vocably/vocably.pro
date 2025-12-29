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
  GoogleLanguage,
  isTense,
  languageList,
  Result,
  resultify,
  Tense,
} from '@vocably/model';
import { isSafeObject, sanitizeTranscript } from '@vocably/sulna';
import { isArray, omit } from 'lodash-es';
import { ChatModel } from 'openai/resources';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { config } from './config';
import { fallback } from './fallback';
import { getTranscriptionName } from './getTranscriptionName';
import { isVerb } from './isVerb';
import {
  caseInsensitiveLanguages,
  genderLanguages,
  numberlessLanguages,
  pluralsWithArticles,
} from './languageSettings';
import { removeAuxiliaryWords } from './removeAuxiliaryWords';
import { sanitizePartOfSpeech } from './sanitizePartOfSpeech';
import { secureSource } from './secureSource';
import { timeout } from './timeout';
import { transformSource } from './transformSource';
import { validateSource } from './validateSource';

export type AiAnalysis = {
  source: string;
  definitions: string[];
  examples: string[];
  lemma: string;
  lemmaPos: string;
  synonyms: string[];
  transcript: string;
  number: string;
  gender?: string;
  tense?: Tense;
  exists?: boolean;
  pastTenses?: string;
  isIrregular?: boolean;
  pluralForm?: string;
};

const isAiAnalysis = (result: any): result is AiAnalysis => {
  if (!isSafeObject(result)) {
    return false;
  }
  return (
    'source' in result &&
    'definitions' in result &&
    'examples' in result &&
    'lemma' in result &&
    'lemmaPos' in result &&
    'synonyms' in result &&
    'number' in result &&
    isArray(result['definitions']) &&
    isArray(result['examples']) &&
    isArray(result['synonyms'])
  );
};

type InternalAiAnalysis = Omit<AiAnalysis, 'source'> & {
  headword: string;
};

const isInternalAiAnalysis = (result: any): result is InternalAiAnalysis => {
  if (!isSafeObject(result)) {
    return false;
  }
  return (
    'headword' in result &&
    'definitions' in result &&
    'examples' in result &&
    'lemma' in result &&
    'lemmaPos' in result &&
    'synonyms' in result &&
    'number' in result &&
    isArray(result['definitions']) &&
    isArray(result['examples']) &&
    isArray(result['synonyms'])
  );
};

const convertInternalToExternal = (
  internal: InternalAiAnalysis
): AiAnalysis => {
  return {
    ...omit(internal, 'headword'),
    source: internal.headword,
  };
};

type AiAnalysePayload = {
  source: string;
  partOfSpeech: string;
  sourceLanguage: GoogleLanguage;
};

type InflectionKey = 'pastTenses' | 'tense' | 'pluralForm' | 'isIrregular';

const tensesPrompts: Partial<Record<GoogleLanguage, string>> = {
  'pt-PT': 'past simple and past perfect tense with necessary auxiliary verbs',
  pt: 'past simple and past perfect tense with necessary auxiliary verbs',
  af: 'past simple and present perfect tense with necessary auxiliary verbs',
  nl: 'past simple and present perfect tense with necessary auxiliary verbs',
  da: 'past simple and present perfect tense with necessary auxiliary verbs',
  no: 'past simple and present perfect tense with necessary auxiliary verbs',
  it: 'past simple and present perfect tense with necessary auxiliary verbs',
  fr: 'past simple and present perfect tense with necessary auxiliary verbs',
  es: 'past simple and present perfect tense with necessary auxiliary verbs',
  de: 'past simple and present perfect tense with necessary auxiliary verbs',
  sv: 'past simple and present perfect tense with necessary auxiliary verbs',
  en: 'past simple and perfect tenses',
  'en-GB': 'past simple and perfect tenses',
};

export const sanitizeEnglishPastTenses = (
  pastTenses: string,
  isIrregular: boolean
): string => {
  const pastTensesArray = pastTenses
    .split(',')
    .map((s) => removeAuxiliaryWords(s.trim(), 'en'));
  if (pastTensesArray.length === 0) {
    return '';
  }

  if (pastTensesArray.length === 1 && isIrregular) {
    return `${pastTensesArray[0]}, ${pastTensesArray[0]}`;
  }

  if (pastTensesArray.length === 1) {
    return pastTensesArray[0];
  }

  if (
    pastTensesArray.length === 2 &&
    pastTensesArray[0] === pastTensesArray[1] &&
    !isIrregular
  ) {
    return pastTensesArray[0];
  }

  return pastTensesArray.join(', ');
};

export const getInflectionsPrompt = ({
  partOfSpeech,
  sourceLanguage,
}: AiAnalysePayload): Partial<Record<InflectionKey, string>> => {
  const infections: Partial<Record<InflectionKey, string>> = {};
  if (isVerb(partOfSpeech) && tensesPrompts[sourceLanguage]) {
    infections.pastTenses = `comma separated list of ${tensesPrompts[sourceLanguage]} of the provided ${partOfSpeech}`;
    infections.tense = 'present, past, or future. English only';
  }

  if (isVerb(partOfSpeech) && ['en', 'en-GB', 'nl'].includes(sourceLanguage)) {
    infections.isIrregular = 'true or false';
  }

  if (
    partOfSpeech.includes('noun') &&
    !numberlessLanguages.includes(sourceLanguage)
  ) {
    infections.pluralForm = `plural form${
      pluralsWithArticles.includes(sourceLanguage)
        ? ' with the appropriate article'
        : ''
    }`;
  }

  return infections;
};

export const sanitizeAiAnalyseResult = (
  language: GoogleLanguage,
  partOfSpeech: string,
  result: AiAnalysis
): AiAnalysis => {
  const genders = genderLanguages[language] ?? [];

  const output: AiAnalysis = {
    ...result,
    source: transformSource({
      source: result.source,
      sourceLanguage: language,
      partOfSpeech,
    }),
    lemmaPos: sanitizePartOfSpeech(result.lemmaPos ?? ''),
    transcript: sanitizeTranscript(result.transcript ?? ''),
  };

  if (genders.includes(result.gender ?? '')) {
    output.gender = result.gender;
  } else {
    delete output.gender;
  }

  if (isTense(result.tense)) {
    output.tense = result.tense;
  }

  if (result.pastTenses && ['en', 'en-GB'].includes(language)) {
    output.pastTenses = sanitizeEnglishPastTenses(
      result.pastTenses,
      !!result.isIrregular
    );
  }

  return output;
};

// ChatGPT
type GptAnalyseChatGptBody = {
  messages: Array<ChatCompletionMessageParam>;
  model: ChatModel;
};

export const getGptAnalyseChatGptBody = ({
  source,
  partOfSpeech,
  sourceLanguage,
}: AiAnalysePayload): GptAnalyseChatGptBody => {
  const isTranscriptionNeeded = source.length <= 20;
  const languageName = languageList[sourceLanguage];

  const genders = genderLanguages[sourceLanguage] ?? [];

  const transcriptionType = getTranscriptionName(sourceLanguage);

  const inflections = getInflectionsPrompt({
    source,
    partOfSpeech,
    sourceLanguage,
  });

  const prompt = [
    `You are a smart language dictionary.`,
    `User provides a word in ${languageName} and its part of speech.`,
    `Only respond in JSON format with an object containing the following properties:`,
    isTranscriptionNeeded ? `transcript - ${transcriptionType}` : ``,
    `headword - word provided by user. Capitalize only when appropriate.`,
    `definitions - list of definitions in ${languageName}.${
      isVerb(partOfSpeech) ? ` Consider tense of the provided word.` : ''
    }`,
    `examples - list of extremely concise examples in ${languageName} with the headword used as a ${partOfSpeech}.`,
    `lemma - lemma or infinitive`,
    `lemmaPos - part of speech of the lemma in English`,
    `synonyms - short list of ${partOfSpeech} synonyms`,
    `number - plural or singular English only`,
    ...Object.entries(inflections).map(([key, value]) => `${key} - ${value}`),
    genders.length > 0 ? `gender - ${genders.join(', ')}, or other` : ``,
  ]
    .filter((s) => !!s)
    .join('\n');

  return {
    messages: [
      { role: 'system', content: prompt },
      { role: 'user', content: source },
      { role: 'user', content: partOfSpeech },
    ],
    model: GPT_4O,
  };
};

type GptAnalyseResultPayload = {
  sourceLanguage: GoogleLanguage;
  partOfSpeech: string;
  response: any;
};

export const getGptAnalyseResult = ({
  sourceLanguage,
  partOfSpeech,
  response,
}: GptAnalyseResultPayload): Result<AiAnalysis> => {
  if (!isInternalAiAnalysis(response)) {
    return {
      success: false,
      reason: 'The GPT request responded with the malformed response',
      extra: { response },
    };
  }

  return {
    success: true,
    value: sanitizeAiAnalyseResult(
      sourceLanguage,
      partOfSpeech,
      convertInternalToExternal(response)
    ),
  };
};

export const gptAnalyse = async ({
  source,
  partOfSpeech,
  sourceLanguage,
}: AiAnalysePayload): Promise<Result<AiAnalysis>> => {
  const responseResult = await chatGptRequest({
    ...getGptAnalyseChatGptBody({ source, partOfSpeech, sourceLanguage }),
    timeoutMs: 100000,
  });

  if (!responseResult.success) {
    return responseResult;
  }

  return getGptAnalyseResult({
    sourceLanguage,
    partOfSpeech,
    response: responseResult.value,
  });
};

// End Of ChatGPT

// Gemini

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

  return {
    model: 'gemini-3-flash-preview',
    contents: createUserContent([source]),
    config: {
      systemInstruction: [
        `You are a language dictionary.`,
        `User provides a ${partOfSpeech} in ${languageName}.${
          isCaseSensitive
            ? ' The provided word can be in any case (e.g., uppercase, lowercase, or mixed case).'
            : ''
        }`,
        `Take the fact that the provided word is ${partOfSpeech} very seriously`,
        `Only respond in JSON format with an object containing the following properties:`,
        isTranscriptionNeeded ? `transcript - ${transcriptionType}` : ``,
        `headword - ${partOfSpeech} provided by user.${
          isCaseSensitive
            ? ' Convert to lowercase, unless it is a word that strictly requires capitalization, then capitalize it.'
            : ''
        }`,
        `exists - does the ${partOfSpeech} "${securedSource}" exist in ${languageName}? true or false`,
        `definitions - list of concise definitions of the ${partOfSpeech} "${securedSource}". Should be in ${languageName}.${
          isVerb(partOfSpeech)
            ? ` Consider tense of the provided ${partOfSpeech}.`
            : ''
        }`,
        `examples - list of extremely concise examples with "${securedSource}" used as ${partOfSpeech}. Omit translations.${
          isCaseSensitive && partOfSpeech.includes('noun')
            ? ' Uppercase when appropriate.'
            : ''
        }`,
        `lemma - lemma or infinitive of the provided ${partOfSpeech}`,
        `lemmaPos - part of speech of the lemma in English`,
        `synonyms - short list of ${partOfSpeech}s`,
        `number - plural or singular English only`,
        ...Object.entries(inflections).map(
          ([key, value]) => `${key} - ${value}`
        ),
        genders.length > 0 ? `gender - ${genders.join(', ')}, or other` : ``,
      ].filter((s) => s.length > 0),
      thinkingConfig: {
        thinkingBudget: 0, // Disables thinking
      },
      temperature: 0,
      responseMimeType: 'application/json',
    },
  };
};

export const getGeminiBatchItem = (payload: AiAnalysePayload) => {
  const params = getGeminiGenerateContentParameters(payload);

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

export const handleGeminiResponse = (
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
    }
  );

  if (result.success === false) {
    return result;
  }

  return handleGeminiResponse(result.value.text ?? '', payload);
};

// End of Gemini

export const getAnalyseCacheFileName = ({
  sourceLanguage,
  source,
  partOfSpeech,
}: AiAnalysePayload): string => {
  return `${sourceLanguage.toLowerCase()}/units-of-speech/${source
    .toLowerCase()
    .replace(/\//g, '-')}/${partOfSpeech
    .toLowerCase()
    .replace(/\//g, '-')}.json`;
};

export const aiAnalyse = async (
  payload: AiAnalysePayload
): Promise<Result<AiAnalysis>> => {
  const isSourceValid = validateSource({
    source: payload.source,
    partOfSpeech: payload.partOfSpeech,
  });
  const fileName = getAnalyseCacheFileName(payload);

  const s3FetchResult = await nodeFetchS3File(
    config.unitsOfSpeechBucket,
    fileName
  );

  if (s3FetchResult.success && s3FetchResult.value !== null) {
    const parseResult = parseJson(s3FetchResult.value);

    if (parseResult.success && isAiAnalysis(parseResult.value)) {
      return {
        success: true,
        value: sanitizeAiAnalyseResult(
          payload.sourceLanguage,
          payload.partOfSpeech,
          parseResult.value
        ),
      };
    }
  }

  const analyseResult = await fallback(geminiAnalyse(payload), () =>
    gptAnalyse(payload)
  );

  if (!analyseResult.success) {
    return analyseResult;
  }

  if (!analyseResult.value.exists) {
    return {
      success: false,
      reason: 'The requested word does not exist in the language',
      errorCode: 'WORD_NOT_EXIST',
    };
  }

  const sanitizedAiAnalyzeResult = sanitizeAiAnalyseResult(
    payload.sourceLanguage,
    payload.partOfSpeech,
    analyseResult.value
  );

  if (
    isSourceValid &&
    !analyseResult.fallenBack &&
    analyseResult.value.exists === true
  ) {
    const putResult = await nodePutS3File(
      config.unitsOfSpeechBucket,
      fileName,
      JSON.stringify(sanitizedAiAnalyzeResult)
    );

    if (!putResult.success) {
      console.error('Failed to put GPT analyse the result to S3', putResult);
    }
  }

  return {
    success: true,
    value: sanitizedAiAnalyzeResult,
  };
};
