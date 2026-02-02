import { nodeSaveUserStaticMetadata } from '@vocably/lambda-shared';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { lastValueFrom, mergeMap, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { buildErrorResponse } from '../../utils/buildErrorResponse';
import { buildResponse } from '../../utils/buildResponse';
import { getSub } from '../../utils/getSub';
import { paddle } from './paddle';

export const paddleWebhook = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> =>
  lastValueFrom(
    of(event).pipe(
      mergeMap(async (event) => {
        console.log('event', JSON.stringify(event, null, 2));
        if (!process.env.PADDLE_WEBHOOK_SECRET_KEY) {
          throw new Error('PADDLE_WEBHOOK_SECRET_KEY is not set');
        }

        const eventEntity = await paddle.webhooks.unmarshal(
          event.body,
          process.env.PADDLE_WEBHOOK_SECRET_KEY,
          event.headers['Paddle-Signature']
        );

        if (eventEntity.eventType !== 'subscription.created') {
          throw new Error('Not a subscription created event');
        }

        if (!eventEntity.data.customData['revenue_cat_id']) {
          throw new Error('No revenue cat id');
        }

        return eventEntity;
      }),
      mergeMap(async (eventEntity) => {
        const subResult = await getSub(
          eventEntity.data.customData['revenue_cat_id']
        );

        if (subResult.success === false) {
          throw new Error(
            `Unable to get sub for email ${eventEntity.data.customData['revenue_cat_id']}`
          );
        }

        console.log('sub', subResult.value);

        const portalSession = await paddle.customerPortalSessions.create(
          eventEntity.data.customerId,
          []
        );

        console.log('portalSession', portalSession);

        if (!portalSession.urls.general.overview) {
          throw new Error('Unable to create portal session');
        }

        console.log('sessionURL', portalSession.urls.general.overview);

        const saveStaticMetadataResult = await nodeSaveUserStaticMetadata(
          subResult.value,
          process.env.STATIC_USER_FILES_BUCKET,
          {
            premium: true,
            management_url: portalSession.urls.general.overview,
          }
        );

        console.log('saveStaticMetadataResult', saveStaticMetadataResult);

        if (saveStaticMetadataResult.success === false) {
          throw new Error('Unable to save static metadata');
        }

        return buildResponse({
          body: JSON.stringify({
            management_url: portalSession.urls.general.overview,
          }),
        });
      }),
      catchError(buildErrorResponse)
    )
  );

exports.paddleWebhook = paddleWebhook;
