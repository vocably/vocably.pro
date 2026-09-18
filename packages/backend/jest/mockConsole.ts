import { afterEach, beforeEach, jest } from '@jest/globals';

type SpyInstance = jest.Spied<(...args: any[]) => any>;

const spies: SpyInstance[] = [];

beforeEach(() => {
  if (spies.length > 0) {
    return;
  }

  const consoleMethods = Object.keys(console).filter(
    // @ts-ignore
    (paramName) => typeof console[paramName] === 'function'
  );

  consoleMethods.forEach((methodName) => {
    // @ts-ignore
    spies.push(jest.spyOn(console, methodName));
  });
});

afterEach(() => {
  spies.forEach((spy) => spy.mockReset());
});
