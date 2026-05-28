import { chatGptRequest, GPT_4O } from '@vocably/lambda-shared';
import { inputTypes, languageList, Result } from '@vocably/model';
import {
  DetectInputTypeAiPayload,
  InputAnalysis,
  isInputAnalysis,
} from './detectInputTypeAi';
import { isQuiteLikelyAWord } from './isQuiteLikelyAWord';

export const detectInputTypeChatGpt = async ({
  source,
  language,
}: DetectInputTypeAiPayload): Promise<Result<InputAnalysis>> => {
  const quiteLikelyAWord = isQuiteLikelyAWord({ source, language });

  const prompt = [
    `You are a ${languageList[language]} dictionary`,
    `User provides an input`,
    `Respond with a JSON object`,
    `- type - ${inputTypes.join(', ')}`,
    `- isDirect - true when the input ${quiteLikelyAWord ? `is a ${languageList[language]} word` : `can be ${languageList[language]}`}`,
  ]
    .filter((s) => !!s)
    .join('\n');

  const responseResult = await chatGptRequest({
    messages: [
      { role: 'system', content: prompt },
      { role: 'user', content: source },
    ],
    model: GPT_4O,
    timeoutMs: 5000,
  });

  if (!responseResult.success) {
    return responseResult;
  }

  const response = responseResult.value;

  if (!isInputAnalysis(response)) {
    return {
      success: false,
      errorCode: 'OPENAI_UNEXPECTED_RESPONSE',
      reason: `Unexpected response from analyzer: ${JSON.stringify(response)}`,
    };
  }

  return {
    success: true,
    value: response,
  };
};
