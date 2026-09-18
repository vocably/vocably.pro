import { expect } from '@jest/globals';
import { difference } from 'lodash-es';

type MatcherResult = {
  pass: boolean;
  message: () => string;
};

// @ts-ignore
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveSomeOf(expected: string | string[]): MatcherResult;
    }
  }

  namespace jasmine {
    interface Matchers<T> {
      toHaveSomeOf(expected: string | string[]): MatcherResult;
    }
  }
}

expect.extend({
  toHaveSomeOf(received: string, expected: string | string[]): MatcherResult {
    const receivedArray = received.split(',').map((s) => s.trim());
    const expectedArray = Array.isArray(expected)
      ? expected
      : expected.split(',').map((s) => s.trim());

    const pass = difference(receivedArray, expectedArray).length === 0;

    return {
      pass,
      message: () => {
        return pass
          ? ''
          : `The received value '${received}' has more values than expected: ${expected}`;
      },
    };
  },
});
