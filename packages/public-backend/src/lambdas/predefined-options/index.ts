import { batchUnitOfSpeechAnalyse, configureAnalyzer } from '@vocably/analyze';
import { parseJson } from '@vocably/api';
import { nodeFetchS3File, nodePutS3File } from '@vocably/lambda-shared';
import { AnalysisItem, Result } from '@vocably/model';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { lastValueFrom, mergeMap, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { buildErrorResponse } from '../../utils/buildErrorResponse';
import { buildResponse } from '../../utils/buildResponse';
import { extractPayload } from './extractPayload';
import { predefinedPartsOfSpeech } from './predefinedPartsOfSpeech';

configureAnalyzer({
  googleProjectId: process.env.GOOGLE_PROJECT_ID as string,
  openaiApiKey: process.env.OPENAI_API_KEY as string,
  awsRegion: process.env.AWS_REGION as string,
  unitsOfSpeechBucket: process.env.UNITS_OF_SPEECH_BUCKET as string,
  geminiApiKey: process.env.GEMINI_API_KEY as string,
});

const publicStaticFilesBucket = process.env
  .PUBLIC_STATIC_FILES_BUCKET as string;

const getCachedValues = async (
  key: string
): Promise<Result<AnalysisItem[]>> => {
  const cached = await nodeFetchS3File(publicStaticFilesBucket, key);
  if (cached.success === false) {
    return cached;
  }

  if (cached.value === null) {
    return { success: false, errorCode: 'CACHE_MISS', reason: 'Cache miss' };
  }

  return parseJson(cached.value);
};

export const predefinedOptions = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  return lastValueFrom(
    of(event).pipe(
      map(extractPayload),
      mergeMap(async (payload) => {
        const key = `predefined-options/${payload.sourceLanguage}-${payload.targetLanguage}.json`;

        const cached = await getCachedValues(key);

        if (cached.success === true) {
          return cached.value;
        }

        const result = await batchUnitOfSpeechAnalyse({
          sourceLanguage: payload.sourceLanguage,
          targetLanguage: payload.targetLanguage,
          unitsOfSpeech: predefinedPartsOfSpeech[payload.sourceLanguage] ?? [],
        });

        if (result.failed.length === 0 && result.items.length > 0) {
          await nodePutS3File(
            publicStaticFilesBucket,
            key,
            JSON.stringify(result.items)
          );
        }

        return result.items;
      }),
      map((result) => {
        return buildResponse({
          body: JSON.stringify(result),
        });
      }),
      catchError(buildErrorResponse)
    )
  );
};

exports.predefinedOptions = predefinedOptions;
