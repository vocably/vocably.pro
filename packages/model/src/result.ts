import { Errors, VocablyErrorCode } from './errors';

export type Error = {
  success: false;
  reason: string;
  errorCode?: VocablyErrorCode | string;
  extra?: any;
};

export type Success<T> = {
  success: true;
  value: T;
};

export type Result<T> = Success<T> | Error;

export const isSuccess = <T>(result: Result<T>): result is Success<T> =>
  result.success === true;

export const isError = (object: any): object is Error => {
  if (typeof object !== 'object' || object === null) {
    return false;
  }

  return (
    object.success === false &&
    Errors.includes(object.errorCode) &&
    object.reason
  );
};

export const resultify = async <T>(
  p: Promise<T>,
  failureReason: {
    errorCode?: VocablyErrorCode | string;
    reason: string;
    extra?: any;
  }
): Promise<Result<T>> => {
  try {
    const value = await p;
    return { success: true, value };
  } catch (e: unknown) {
    return {
      success: false,
      ...failureReason,
      extra: {
        ...failureReason.extra,
        error: e,
      },
    };
  }
};
