import { parseJson } from '@vocably/api';
import { nodeFetchS3File, nodePutS3File } from '@vocably/lambda-shared';
import { isTranslation, Result } from '@vocably/model';
import { isArray } from 'lodash-es';
import { translateWithChatGpt } from './aiFetchPossibleTranslationChatGPT';
import { translateWithGemini } from './aiFetchPossibleTranslationGemini';
import {
  Payload,
  ValidTranslations,
} from './aiFetchPossibleTranslationsCommon';
import { config } from './config';
import { fallback } from './fallback';

export const truncateText = (text: string, length: number): string => {
  return text.replace(/[<>]/gm, '').slice(0, length);
};

export const aiFetchPossibleTranslations = async (
  payload: Payload
): Promise<Result<ValidTranslations>> => {
  return fallback(translateWithGemini(payload), () =>
    translateWithChatGpt(payload)
  );
};

const getTranslationsCacheFileName = ({
  source,
  sourceLanguage,
  targetLanguage,
  inputType,
}: Payload): string => {
  const inputTypePart = inputType ? `/${inputType}` : '';

  return `_reverse-translations/${targetLanguage.toLowerCase()}/${sourceLanguage.toLocaleLowerCase()}/${source
    .toLowerCase()
    .replace(/\//g, '-')}${inputTypePart}.json`;
};

const isValidTranslations = (data: any): data is ValidTranslations => {
  return isArray(data) && data.length > 0 && data.every(isTranslation);
};

export const aiFetchPossibleTranslationsCached = async (
  payload: Payload
): Promise<Result<ValidTranslations>> => {
  const fileName = getTranslationsCacheFileName(payload);

  const s3FetchResult = await nodeFetchS3File(
    config.unitsOfSpeechBucket,
    fileName
  );

  if (s3FetchResult.success && s3FetchResult.value !== null) {
    const parseResult = parseJson(s3FetchResult.value);

    if (parseResult.success && isValidTranslations(parseResult.value)) {
      return {
        success: true,
        value: parseResult.value,
      };
    }
  }

  const result = await aiFetchPossibleTranslations(payload);

  if (!result.success) {
    return result;
  }

  if (payload.inputType !== 'sentence') {
    await nodePutS3File(
      config.unitsOfSpeechBucket,
      fileName,
      JSON.stringify(result.value, null, 2)
    );
  }

  return result;
};
