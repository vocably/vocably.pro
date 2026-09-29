import { inputTypes, languageList, Result, resultify } from '@vocably/model';
import { timeout } from '@vocably/sulna';
import { config } from './config';
import {
  DetectInputTypeAiPayload,
  InputAnalysis,
  isInputAnalysis,
} from './detectInputTypeAi';
import { isQuiteLikelyAWord } from './isQuiteLikelyAWord';

type JevResponse = {
  answers?: {
    type?: { choice?: string };
    isDirect?: { noul?: number };
  };
};

export const detectInputTypeJev = async ({
  source,
  language,
}: DetectInputTypeAiPayload): Promise<Result<InputAnalysis>> => {
  const abortController = new AbortController();
  const abortSignal = abortController.signal;

  const quiteLikelyAWord = isQuiteLikelyAWord({ source, language });

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
          state: source,
          questions: {
            type: {
              type: 'choice',
              instructions: 'Linguistic classification of the text input',
              criteria: Object.fromEntries(
                inputTypes.map((inputType) => [inputType, inputType])
              ),
            },
            isDirect: {
              type: 'noul',
              instructions: `The input ${quiteLikelyAWord ? 'is valid in' : 'can be'} ${languageList[language]}`,
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

  const value = {
    type: answers?.type?.choice,
    isDirect:
      typeof answers?.isDirect?.noul === 'number'
        ? answers.isDirect.noul >= 0.5
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
