import {
  GoogleLanguage,
  languageList,
  Result,
  resultify,
} from '@vocably/model';
import { timeout } from '@vocably/sulna';
import { config } from './config';
import {
  DetectInputTypeAiPayload,
  InputAnalysis,
  isInputAnalysis,
} from './detectInputTypeAi';

// Languages the input is most commonly confused with.
// The requested language is always added to the list.
const candidateLanguages: GoogleLanguage[] = [
  'en',
  'de',
  'nl',
  'fr',
  'es',
  'it',
  'pt',
  'ru',
  'uk',
  'pl',
  'zh',
  'ja',
];

// Jev's "not direct" probabilities rarely exceed 0.15,
// while valid inputs usually score above 0.5.
const isDirectThreshold = 0.3;

type JevResponse = {
  answers?: {
    type?: { choice?: string };
    language?: { probabilities?: Record<string, number> };
  };
};

export const detectInputTypeJev = async ({
  source,
  language,
}: DetectInputTypeAiPayload): Promise<Result<InputAnalysis>> => {
  const abortController = new AbortController();
  const abortSignal = abortController.signal;

  const languages = Array.from(new Set([language, ...candidateLanguages]));

  const result = await resultify(
    timeout(
      fetch('https://api.typesafe.ai/v1/systemone', {
        method: 'POST',
        signal: abortSignal,
        headers: {
          Authorization: `Bearer ${config.jevApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'jev-latest',
          state: { text: source },
          questions: {
            type: {
              type: 'choice',
              instructions: 'Linguistic classification of `text`',
              criteria: {
                word: {
                  what: 'A single word, including inflected forms and rare or archaic words',
                  not_for: 'Multi-word units',
                  examples: ['house', 'melancholisch', '猫'],
                },
                'compound word': {
                  what: 'Several words that together name a single concept (a lexicalised noun group or open compound)',
                  not_for: 'Free phrases or idioms',
                  examples: ['ice cream', 'train station', 'железная дорога'],
                },
                'phrasal verb': {
                  what: 'A verb plus particle(s) with a combined meaning',
                  examples: ['give up', 'look after'],
                },
                phrase: {
                  what: 'A group of words that is not a full sentence and not a fixed expression',
                  examples: ['in the morning', 'a big red car'],
                },
                sentence: {
                  what: 'A complete clause with a subject and predicate',
                  examples: ['I like tea', 'She went home yesterday'],
                },
                idiom: {
                  what: 'A fixed expression whose meaning is figurative',
                  examples: ['kick the bucket', 'break the ice'],
                },
              },
            },
            language: {
              type: 'choice',
              instructions: `Which language could \`text\` belong to? Prefer ${languageList[language]} if \`text\` is a valid ${languageList[language]} word or expression`,
              criteria: Object.fromEntries(
                languages.map((code) => [
                  code,
                  `${languageList[code]} word or expression`,
                ])
              ),
            },
          },
        }),
      }).then(async (response) => {
        if (!response.ok) {
          throw new Error(
            `Jev responded with ${response.status}: ${await response.text()}`
          );
        }

        return (await response.json()) as JevResponse;
      }),
      abortController,
      3000
    ),
    {
      reason: 'detectInputTypeJev: Unable to perform Jev detection.',
      extra: { source, language },
    }
  );

  if (result.success === false) {
    return result;
  }

  const answers = result.value.answers;
  const languageProbability = answers?.language?.probabilities?.[language];

  const value = {
    type: answers?.type?.choice,
    isDirect:
      typeof languageProbability === 'number'
        ? languageProbability >= isDirectThreshold
        : undefined,
  };

  if (!isInputAnalysis(value)) {
    return {
      success: false,
      reason:
        'Unsupported input type returned from Jev: ' +
        JSON.stringify(result.value),
    };
  }

  return {
    success: true,
    value,
  };
};
