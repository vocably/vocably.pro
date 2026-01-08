import { batchUnitOfSpeechAnalyse, configureAnalyzer } from '@vocably/analyze';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { lastValueFrom, mergeMap, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { buildErrorResponse } from '../../utils/buildErrorResponse';
import { buildResponse } from '../../utils/buildResponse';
import { extractPayload } from './extractPayload';

configureAnalyzer({
  googleProjectId: process.env.GOOGLE_PROJECT_ID as string,
  openaiApiKey: process.env.OPENAI_API_KEY as string,
  awsRegion: process.env.AWS_REGION as string,
  unitsOfSpeechBucket: process.env.UNITS_OF_SPEECH_BUCKET as string,
  geminiApiKey: process.env.GEMINI_API_KEY as string,
});

export const analyzeUnitsOfSpeech = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  return lastValueFrom(
    of(event).pipe(
      map(extractPayload),
      mergeMap((payload) => {
        return batchUnitOfSpeechAnalyse(payload);
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

exports.analyzeUnitsOfSpeech = analyzeUnitsOfSpeech;
