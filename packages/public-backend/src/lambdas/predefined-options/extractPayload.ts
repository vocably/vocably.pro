import { GoogleLanguage, isGoogleLanguage } from '@vocably/model';
import { APIGatewayProxyEvent } from 'aws-lambda';

export interface PredefinedOptionsPayload {
  sourceLanguage: GoogleLanguage;
  targetLanguage: GoogleLanguage;
}

export const extractPayload = (
  event: APIGatewayProxyEvent
): PredefinedOptionsPayload => {
  const queryParams = event.queryStringParameters || {};
  const { sourceLanguage, targetLanguage } = queryParams;

  if (!sourceLanguage || !isGoogleLanguage(sourceLanguage)) {
    throw {
      success: false,
      errorCode: 'REQUEST_MALFORMED_QUERY_PARAMS',
      reason: 'Missing or invalid sourceLanguage query parameter',
      extra: { queryParams },
    };
  }

  if (!targetLanguage || !isGoogleLanguage(targetLanguage)) {
    throw {
      success: false,
      errorCode: 'REQUEST_MALFORMED_QUERY_PARAMS',
      reason: 'Missing or invalid targetLanguage query parameter',
      extra: { queryParams },
    };
  }

  return {
    sourceLanguage,
    targetLanguage,
  };
};
