import { APIGatewayProxyEvent } from 'aws-lambda';
import { lastValueFrom, mergeMap, of, tap } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { buildErrorResponse } from '../../utils/buildErrorResponse';
import { buildResponse } from '../../utils/buildResponse';
import { sendFeedback } from './sendFeedback';

export const userFeedback = async (event: APIGatewayProxyEvent): Promise<any> =>
  lastValueFrom(
    of(event).pipe(
      tap(console.log),
      mergeMap(sendFeedback),
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

exports.userFeedback = userFeedback;
