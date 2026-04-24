export const singlePromise = <A extends any[], T>(
  f: (...args: A) => Promise<T>
) => {
  let currentPromise: Promise<T> | null = null;
  return (...args: A): Promise<T> => {
    if (currentPromise) {
      return currentPromise;
    }

    currentPromise = f(...args).finally(() => (currentPromise = null));
    return currentPromise;
  };
};
