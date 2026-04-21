import { isDetectedInputType, Result } from '@vocably/model';
import { InputAnalysis, DetectInputTypeAiPayload } from './detectInputTypeAi';
import { nodeS3Scan } from '@vocably/lambda-shared';
import { config } from './config';

const getPartOfSpeech = (unitOfSpeechPath: string): string => {
  const parts = unitOfSpeechPath.split('/');
  return parts[parts.length - 1].replace('.json', '');
};

export const detectInputTypeS3 = async (
  payload: DetectInputTypeAiPayload
): Promise<Result<InputAnalysis>> => {
  const prefix = `${payload.language}/units-of-speech/${payload.source.toLowerCase()}/`;
  const scanResult = await nodeS3Scan(config.unitsOfSpeechBucket, prefix);

  if (scanResult.success === false) {
    return scanResult;
  }

  if (scanResult.value.length === 0) {
    return {
      success: false,
      reason: `No units of speech found for the source ${payload.source} in the language ${payload.language}`,
    };
  }

  const partsOfSpeech = scanResult.value.map(getPartOfSpeech);

  const detectedInputType = partsOfSpeech.find(isDetectedInputType);

  if (detectedInputType) {
    return {
      success: true,
      value: {
        type: detectedInputType,
        isDirect: true,
      },
    };
  }

  return {
    success: true,
    value: {
      type: 'word',
      isDirect: true,
    },
  };
};
