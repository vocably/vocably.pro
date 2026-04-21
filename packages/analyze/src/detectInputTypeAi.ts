import {
  ChatGPTLanguage,
  DetectedInputType,
  inputTypes,
  Result,
} from '@vocably/model';
import { detectInputTypeChatGpt } from './detectInputTypeChatGpt';
import { detectInputTypeGemini } from './detectInputTypeGemini';
import { fallback } from './fallback';
import { detectInputTypeS3 } from './detectInputTypeS3';

export type DetectInputTypeAiPayload = {
  source: string;
  language: ChatGPTLanguage;
};

export type InputAnalysis = {
  type: DetectedInputType;
  isDirect: boolean;
};

export const isInputAnalysis = (v: any): v is InputAnalysis => {
  return (
    typeof v['type'] === 'string' &&
    typeof v['isDirect'] === 'boolean' &&
    //@ts-ignore
    inputTypes.includes(v['type'].toLowerCase())
  );
};

export const detectInputTypeAi = async (
  payload: DetectInputTypeAiPayload
): Promise<Result<InputAnalysis>> => {
  const fastDetectionResult = await detectInputTypeS3(payload);

  if (fastDetectionResult.success) {
    return fastDetectionResult;
  }

  return fallback(detectInputTypeGemini(payload), () =>
    detectInputTypeChatGpt(payload)
  );
};
