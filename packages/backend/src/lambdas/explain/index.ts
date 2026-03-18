import {
  configureAnalyzer,
  explainSentence,
  mineUnitsOfSpeech,
} from '@vocably/analyze';
import { trimArticle } from '@vocably/sulna';
import {
  type APIGatewayProxyEvent,
  type APIGatewayProxyResult,
} from 'aws-lambda';
import { lastValueFrom, mergeMap, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { buildErrorResponse } from '../../utils/buildErrorResponse';
import { buildResponse } from '../../utils/buildResponse';
import { extractPayload } from './extractPayload';
import { sanitizePayload } from './sanitizePayload';
import { Explanation } from '@vocably/model';

configureAnalyzer({
  googleProjectId: process.env.GOOGLE_PROJECT_ID as string,
  openaiApiKey: process.env.OPENAI_API_KEY as string,
  geminiApiKey: process.env.GEMINI_API_KEY as string,
  awsRegion: process.env.AWS_REGION as string,
  unitsOfSpeechBucket: process.env.UNITS_OF_SPEECH_BUCKET as string,
});

export const explain = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> =>
  lastValueFrom(
    of(event).pipe(
      map(extractPayload),
      map(sanitizePayload),
      mergeMap(async (payload) => {
        const source = trimArticle(
          payload.sourceLanguage,
          payload.source.trim()
        ).source;

        if (source.length === 0 || source.split(' ').length === 1) {
          return Promise.resolve({
            success: true,
            value: {
              sourceLanguage: payload.sourceLanguage,
              targetLanguage: payload.targetLanguage,
              explanation: '',
            },
          });
        }

        const [explainResult, mineUnitsOfSpeechResult] = await Promise.all([
          explainSentence(payload),
          mineUnitsOfSpeech(payload),
        ]);

        if (explainResult.success === false) {
          throw explainResult;
        }

        const explanation: Explanation = {
          sourceLanguage: payload.sourceLanguage,
          targetLanguage: payload.targetLanguage,
          explanation: explainResult.value.explanation,
          unitsOfSpeech: mineUnitsOfSpeechResult.success
            ? mineUnitsOfSpeechResult.value
            : [],
        };

        return explanation;
      }),
      map((explanation) => {
        return buildResponse({
          body: JSON.stringify(explanation),
        });
      }),
      catchError(buildErrorResponse)
    )
  );

exports.bulkAnalize = explain;
