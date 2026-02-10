import { AnalysisItem, GoogleLanguage, Result } from '@vocably/model';
import { publicRequest } from './publicRestClient';

export const publicPredefinedOptions = async (
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
