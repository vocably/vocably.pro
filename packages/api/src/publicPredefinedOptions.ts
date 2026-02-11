import { AnalysisItem, GoogleLanguage, Result } from '@vocably/model';
import { isArray } from 'lodash-es';
import { publicRequest } from './publicRestClient';
import { publicStaticFile } from './publicStaticFile';

const publicPredefinedOptionsApiRequest = async (
  sourceLanguage: GoogleLanguage,
  targetLanguage: GoogleLanguage,
  abortController?: AbortController
): Promise<Result<AnalysisItem[]>> => {
  try {
    const searchParams = new URLSearchParams({
      sourceLanguage,
      targetLanguage,
    });

    return await publicRequest(
      `/predefined-options?${searchParams.toString()}`,
      {
        method: 'GET',
        signal: abortController?.signal,
      }
    );
  } catch (e) {
    return {
      success: false,
      errorCode: 'API_PUBLIC_PREDEFINED_OPTIONS_REQUEST_FAILED',
      reason: 'The predefined options request has failed.',
      extra: e,
    };
  }
};

export const publicPredefinedOptions = async (
  sourceLanguage: GoogleLanguage,
  targetLanguage: GoogleLanguage,
  abortController?: AbortController
): Promise<Result<AnalysisItem[]>> => {
  const staticFileResult = await publicStaticFile(
    `predefined-options/${sourceLanguage}-${targetLanguage}.json`,
    abortController
  );

  if (staticFileResult.success && isArray(staticFileResult.value)) {
    return staticFileResult;
  }

  return publicPredefinedOptionsApiRequest(
    sourceLanguage,
    targetLanguage,
    abortController
  );
};
