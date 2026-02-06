import { Result } from '@vocably/model';
import { merge } from 'lodash-es';

export const request = async (
  url: string,
  init: RequestInit
): Promise<Result<any>> => {
  try {
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    const response = await fetch(
      url,
      merge(init, {
        headers,
      })
    );

    if (!response.ok) {
      console.error('API error', await response.text());
      return {
        success: false,
        errorCode: 'API_REQUEST_NOT_OK',
        reason: 'The API has returned failed status.',
        extra: response,
      };
    }

    if (
      response.headers.has('Content-Type') &&
      response.headers.get('Content-Type') === 'application/json' &&
      response.headers.get('Content-Length') !== '0'
    ) {
      return {
        success: true,
        value: await response.json(),
      };
    }

    return {
      success: true,
      value: await response.text(),
    };
  } catch (e: any) {
    if (e.name === 'AbortError') {
      return {
        success: false,
        errorCode: 'API_REQUEST_ABORTED',
        reason: 'The request was aboarted by another user operation.',
        extra: e,
      };
    }

    if (
      e.message === 'Failed to fetch' ||
      e.message === 'Network request failed'
    ) {
      return {
        success: false,
        errorCode: 'NETWORK_REQUEST_ERROR',
        reason: 'Network request failed',
        extra: e,
      };
    }

    return {
      success: false,
      errorCode: 'API_REQUEST_UNHANDLED_ERROR',
      reason: 'Un unexpected error has occurred during the request.',
      extra: e,
    };
  }
};
