import Anthropic from '@anthropic-ai/sdk';
import { parseJson } from '@vocably/api';
import {
  DetectedInputType,
  languageList,
  Result,
  resultify,
} from '@vocably/model';
import { timeout } from '@vocably/sulna';
import { createHash } from 'crypto';
import {
  Payload,
  sanitizeModelResponse,
  toValidTranslations,
  ValidTranslations,
} from './aiFetchPossibleTranslationsCommon';
import { config } from './config';
import { getTranscriptionName } from './getTranscriptionName';
import { secureSource } from './secureSource';

const CLAUDE_MODEL = 'claude-sonnet-5-5';

type ClaudeTranslateParams = Anthropic.MessageCreateParamsNonStreaming;

const isCompound = (
  detectedInputType: DetectedInputType | undefined
): boolean => {
  return ['sentence'].includes(detectedInputType as DetectedInputType);
};

/**
 * Structured outputs require an object at the root,
 * so translations are wrapped into `{ translations: [...] }`.
 * `sanitizeModelResponse` unwraps it.
 */
const getResponseSchema = (payload: Payload) => {
  const type = payload.inputType ?? 'word, phrase, or sentence';

  const properties: Record<string, { type: 'string'; description: string }> = {
    translation: {
      type: 'string',
      description: `the translation of the ${type} into ${
        languageList[payload.targetLanguage]
      }`,
    },
  };

  if (!isCompound(payload.inputType)) {
    Object.assign(properties, {
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
    });
  }

  return {
    type: 'object',
    properties: {
      translations: {
        type: 'array',
        items: {
          type: 'object',
          properties,
          required: ['translation'],
          additionalProperties: false,
        },
      },
    },
    required: ['translations'],
    additionalProperties: false,
  };
};

export const getClaudeTranslateParams = (
  payload: Payload
): ClaudeTranslateParams => {
  const source = secureSource(payload.source);
  const type = payload.inputType ?? 'word, phrase, or sentence';
  const sourceLanguage = languageList[payload.sourceLanguage];
  const targetLanguage = languageList[payload.targetLanguage];

  return {
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    // Low effort keeps dictionary lookups fast and cheap.
    output_config: {
      effort: 'low',
      format: {
        type: 'json_schema',
        schema: getResponseSchema(payload),
      },
    },
    system: [
      `User provides a ${type} in any language, but most likely in ${sourceLanguage}.`,
      `Provide possible translations into ${targetLanguage} and only in ${targetLanguage}.`,
      `Include the common synonyms and the translations of each common meaning, most common first. Keep the part of speech of the input.`,
      `Avoid splitting. Don't split. Translate it as single unit of speech.`,
    ].join('\n'),
    messages: [
      {
        role: 'user',
        content: source,
      },
    ],
  };
};

/**
 * Batch `custom_id` must match ^[a-zA-Z0-9_-]{1,64}$,
 * so the payload identity is hashed. Use this to map batch results back to payloads.
 */
export const getClaudeTranslateBatchItemKey = (payload: Payload): string =>
  createHash('sha256')
    .update(
      JSON.stringify({
        source: payload.source,
        sourceLanguage: payload.sourceLanguage,
        targetLanguage: payload.targetLanguage,
        inputType: payload.inputType,
      })
    )
    .digest('hex');

export const getClaudeTranslateBatchItem = (
  payload: Payload
): Anthropic.Messages.BatchCreateParams.Request => {
  return {
    custom_id: getClaudeTranslateBatchItemKey(payload),
    params: getClaudeTranslateParams(payload),
  };
};

export const handleClaudeTranslateResponse = (
  message: Anthropic.Message | Anthropic.Beta.BetaMessage,
  payload: Payload
): Result<ValidTranslations> => {
  if (
    message.stop_reason === 'refusal' ||
    message.stop_reason === 'max_tokens'
  ) {
    return {
      success: false,
      reason: `Claude translation stopped with reason "${message.stop_reason}".`,
      extra: { result: message, payload },
    };
  }

  const text = message.content
    .map((block) => (block.type === 'text' ? block.text : ''))
    .join('');

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

export const translateWithClaude = async (
  payload: Payload
): Promise<Result<ValidTranslations>> => {
  const client = new Anthropic({
    apiKey: config.claudeApiKey,
  });

  const abortController = new AbortController();

  const result = await resultify(
    timeout(
      // Fallbacks are not supported by the Batches API, so they're added only here.
      client.beta.messages.create(
        {
          ...getClaudeTranslateParams(payload),
          betas: ['server-side-fallback-2026-07-01'],
          fallbacks: 'default',
        },
        { signal: abortController.signal }
      ),
      abortController,
      10_000
    ),
    {
      reason: 'translateWithClaude: Unable to perform Claude translation.',
      extra: payload,
    }
  );

  if (result.success === false) {
    return result;
  }

  return handleClaudeTranslateResponse(result.value, payload);
};
