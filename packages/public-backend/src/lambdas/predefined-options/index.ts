import { batchUnitOfSpeechAnalyse, configureAnalyzer } from '@vocably/analyze';
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

export const predefinedOptions = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  return lastValueFrom(
    of(event).pipe(
      map(extractPayload),
      mergeMap((payload) => {
        return batchUnitOfSpeechAnalyse({
          sourceLanguage: payload.sourceLanguage,
          targetLanguage: payload.targetLanguage,
          unitsOfSpeech: predefinedPartsOfSpeech[payload.sourceLanguage] ?? [],
        });
      }),
      map((result) => {
        return buildResponse({
          body: JSON.stringify(result.items),
        });
      }),
      catchError(buildErrorResponse)
    )
  );
};

exports.predefinedOptions = predefinedOptions;
