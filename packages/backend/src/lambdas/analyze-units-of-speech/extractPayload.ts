import { parseJson } from '@vocably/api';
import {
  BatchUnitOfSpeechAnalyzePayload,
  isBatchUnitOfSpeechAnalyzePayload,
} from '@vocably/model';
import { APIGatewayProxyEvent } from 'aws-lambda';

export const extractPayload = (
  event: APIGatewayProxyEvent
): BatchUnitOfSpeechAnalyzePayload => {
  const parseResult = parseJson(event.body ?? '{}');

  if (!parseResult.success) {
    throw {
      success: false,
      errorCode: 'REQUEST_MALFORMED_PAYLOAD',
      reason: 'Unable to parse payload',
      extra: { body: event.body },
    };
  }

  const payload = parseResult.value;

  if (!isBatchUnitOfSpeechAnalyzePayload(payload)) {
    throw {
      success: false,
      errorCode: 'REQUEST_MALFORMED_PAYLOAD',
      reason:
        'The request payload is not of BatchUnitOfSpeechAnalyzePayload type',
      extra: { payload },
    };
  }

  return payload;
};
