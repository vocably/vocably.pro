import {
  ChatGPTLanguage,
  DetectedInputType,
  inputTypes,
  Result,
} from '@vocably/model';
import { detectInputTypeChatGpt } from './detectInputTypeChatGpt';
import { detectInputTypeGemini } from './detectInputTypeGemini';
import { detectInputTypeJev } from './detectInputTypeJev';
import { fallback } from './fallback';

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
  // ToDo: fix and uncomment

  // const fastDetectionResult = await detectInputTypeS3(payload);
  //
  // if (fastDetectionResult.success) {
  //   return fastDetectionResult;
  // }

  const detectWithGemini = () =>
    fallback(detectInputTypeGemini(payload), () =>
      detectInputTypeChatGpt(payload)
    );

  if (payload.language === 'en') {
    return fallback(
      detectInputTypeJev({ ...payload, language: payload.language }),
      detectWithGemini
    );
  }

  return detectWithGemini();
};
