import { APIGatewayProxyEvent } from 'aws-lambda';
import { lastValueFrom, mergeMap, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { buildErrorResponse } from '../../utils/buildErrorResponse';
import { buildResponse } from '../../utils/buildResponse';
import { chatWithCard } from './chatWithCard';
import { extractPayload } from './extractPayload';
import { sanitizePayload } from './sanitizePayload';

export const chatWithCardFunction = async (
  event: APIGatewayProxyEvent
): Promise<any> =>
  lastValueFrom(
    of(event).pipe(
      map(extractPayload),
      map(sanitizePayload),
      mergeMap(async (payloadResult) => {
        if (payloadResult.success === false) {
          return payloadResult;
        }

        return chatWithCard(payloadResult.value);
      }),
      map((result) => {
        if (result.success === false) {
          throw result;
        }

        return buildResponse({
          body: JSON.stringify(result.value),
        });
      }),
      catchError(buildErrorResponse)
    )
  );

exports.chatWithCard = chatWithCardFunction;
