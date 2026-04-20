import { parseJson } from '@vocably/api';
import { FixGrammarPayload, isGoogleLanguage } from '@vocably/model';
import { APIGatewayProxyEvent } from 'aws-lambda';

const isFixGrammarPayload = (data: any): data is FixGrammarPayload =>
  typeof data === 'object' &&
  data !== null &&
  typeof data['text'] === 'string' &&
  isGoogleLanguage(data['language']) &&
  (data['context'] === undefined || typeof data['context'] === 'string') &&
  (data['explanationLanguage'] === undefined ||
    isGoogleLanguage(data['explanationLanguage']));

export const extractPayload = (
  event: APIGatewayProxyEvent
): FixGrammarPayload => {
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

  if (!isFixGrammarPayload(payload)) {
    throw {
      success: false,
      errorCode: 'REQUEST_MALFORMED_PAYLOAD',
      reason: 'The request payload is not of FixGrammarPayload type',
      extra: { payload },
    };
  }

  return payload;
};
