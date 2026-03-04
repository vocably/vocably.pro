export const timeout = async <T>(
  promise: Promise<T>,
  abortController: AbortController,
  ms: number
): Promise<T> => {
  const timeoutId = setTimeout(() => abortController.abort(), ms);
  try {
    return await promise;
  } finally {
    clearTimeout(timeoutId);
  }
};
