import { createUserContent, GoogleGenAI } from '@google/genai';
import { parseJson } from '@vocably/api';
import { chatGptRequest, GPT_4O, GPT_4O_MINI } from '@vocably/lambda-shared';
import {
  AiTranslation,
  ChatGPTLanguage,
  GoogleLanguage,
  languageList,
  Result,
  resultify,
} from '@vocably/model';
import { sanitizeTranscript } from '@vocably/sulna';
import { get } from 'lodash-es';
import { config } from './config';
import { InputAnalysis } from './detectInputTypeAi';
import { fallback } from './fallback';
import { sanitizePartOfSpeech } from './sanitizePartOfSpeech';
import { secureSource } from './secureSource';

type Payload = {
  source: string;
  context: string;
  sourceLanguage: ChatGPTLanguage;
  targetLanguage: GoogleLanguage;
  inputType: InputAnalysis['type'];
  isDirect: boolean;
};

type ContextTranslation = {
  source: string;
  target: string;
  lemma: string;
  lemmaPos: string;
  partOfSpeech?: string;
  transcript?: string;
};

const isContextTranslation = (o: any): o is ContextTranslation => {
  return !(!o || !o.target || !o.source || !o.lemma || !o.lemmaPos);
};

const transcriptionName = {
  zh: 'pinyin',
  'zh-TW': 'pinyin',
  ja: 'romaji',
  ko: 'hangul',
  vi: 'vietnamese',
  th: 'thai',
  id: 'indonesian',
  ms: 'malay',
  my: 'burmese',
  hi: 'hindi',
  ar: 'arabic',
};

export const translateFromContextGemini = async (
  payload: Payload
): Promise<Result<AiTranslation>> => {
  const isTranscriptionNeeded = payload.source.length <= 20;

  const genAI = new GoogleGenAI({
    apiKey: config.geminiApiKey,
  });

  const safeSourceLanguage = languageList[payload.sourceLanguage];
  const safeTargetLanguage = languageList[payload.targetLanguage];

  const safeSource = secureSource(payload.source);

  const result = await resultify(
    genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: createUserContent([payload.context, safeSource]),
      config: {
        systemInstruction: [
          `You are a language dictionary.`,
          `User provides two inputs:`,
          `The first input is context`,
          `The second input is a ${payload.inputType}`,
          `Only respond in JSON format with an object containing the following properties:`,
          `- source - "${safeSource}" translated in ${safeSourceLanguage}`,
          `- target - "${safeSource}" in ${safeTargetLanguage}`,
          `- partOfSpeech - part of speech of "${safeSource}" in English`,
          `- lemma - ${safeSourceLanguage} lemma or infinitive`,
          `- lemmaPos - part of speech of the lemma in English`,
          isTranscriptionNeeded
            ? `- transcript - the ${get(
                transcriptionName,
                payload.sourceLanguage,
                'IPA'
              )} transcription of the ${safeSourceLanguage} ${
                payload.inputType
              }`
            : '',
        ],
        thinkingConfig: {
          thinkingBudget: 0, // Disables thinking
        },
        temperature: 0,
        responseMimeType: 'application/json',
      },
    }),
    {
      reason:
        'translateFromContextGemini: Unable to perform Gemini translation.',
      extra: payload,
    }
  );

  if (!result.success) {
    return result;
  }

  const parseResult = parseJson(result.value.text ?? '');
  if (!parseResult.success) {
    return parseResult;
  }

  if (!isContextTranslation(parseResult.value)) {
    return {
      success: false,
      errorCode: 'OPENAI_UNEXPECTED_RESPONSE',
      reason: `Unexpected response from analyzer: ${result.value.text}`,
    };
  }

  return {
    success: true,
    value: {
      source: parseResult.value.source,
      sourceLanguage: payload.sourceLanguage,
      targetLanguage: payload.targetLanguage,
      target: parseResult.value.target,
      partOfSpeech: sanitizePartOfSpeech(parseResult.value.partOfSpeech ?? ''),
      transcript: sanitizeTranscript(parseResult.value.transcript ?? ''),
      lemma: parseResult.value.lemma,
      lemmaPos: sanitizePartOfSpeech(parseResult.value.lemmaPos ?? ''),
    },
  };
};

export const translateFromContextChatGpt = async (
  payload: Payload
): Promise<Result<AiTranslation>> => {
  const isTranscriptionNeeded = payload.source.length <= 20;

  const prompt = [
    `You are a smart language dictionary.`,
    `Use provides two inputs:`,
    `The first input is context sentence`,
    `The second input is substring in that sentence`,
    `Only respond in JSON format with an object containing the following properties:`,
    `- source - the substring translated into ${
      languageList[payload.sourceLanguage]
    }`,
    `- target - the substring translated into${
      languageList[payload.targetLanguage]
    }`,
    `- partOfSpeech - part of speech in English`,
    `- lemma - ${languageList[payload.sourceLanguage]} lemma or infinitive`,
    `- lemmaPos - part of speech of the lemma in English`,
    isTranscriptionNeeded
      ? `- transcript - the ${get(
          transcriptionName,
          payload.sourceLanguage,
          'IPA'
        )} transcription of the ${languageList[payload.sourceLanguage]} source`
      : null,
  ]
    .filter((s) => !!s)
    .join('\n');

  const responseResult = await chatGptRequest({
    messages: [
      { role: 'system', content: prompt },
      { role: 'user', content: payload.context },
      { role: 'user', content: payload.source },
    ],
    model: payload.sourceLanguage === 'en' ? GPT_4O_MINI : GPT_4O,
    timeoutMs: 5000,
  });

  if (!responseResult.success) {
    return responseResult;
  }

  const response = responseResult.value;

  if (!isContextTranslation(response)) {
    return {
      success: false,
      errorCode: 'OPENAI_UNEXPECTED_RESPONSE',
      reason: `Unexpected response from analyzer: ${JSON.stringify(response)}`,
    };
  }

  return {
    success: true,
    value: {
      source: response.source,
      sourceLanguage: payload.sourceLanguage,
      targetLanguage: payload.targetLanguage,
      target: response.target,
      partOfSpeech: sanitizePartOfSpeech(response.partOfSpeech ?? ''),
      transcript: sanitizeTranscript(response.transcript ?? ''),
      lemma: response.lemma,
      lemmaPos: sanitizePartOfSpeech(response.lemmaPos ?? ''),
    },
  };
};

export const translateFromContext = async (
  payload: Payload
): Promise<Result<AiTranslation>> => {
  return fallback(translateFromContextGemini(payload), () =>
    translateFromContextChatGpt(payload)
  );
};
