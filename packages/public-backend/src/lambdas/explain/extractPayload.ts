import { ExplainPayload, isExplainPayload } from '@vocably/model';
import { APIGatewayProxyEvent } from 'aws-lambda';

export const extractPayload = (event: APIGatewayProxyEvent): ExplainPayload => {
  const payload = JSON.parse(event.body ?? '{}');

  if (!isExplainPayload(payload)) {
    throw {
      success: false,
      errorCode: 'MALFORMED_PAYLOAD',
      reason: 'Incorrect payload',
      extra: { payload },
    };
  }

  return payload;
};
