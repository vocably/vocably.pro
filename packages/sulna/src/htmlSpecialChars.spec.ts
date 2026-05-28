import { htmlSpecialChars } from './htmlSpecialChars';

describe('htmlSpecialChars', () => {
  it('works with single quote', () => {
    const text = "Hello, 'world'";
    const result = htmlSpecialChars(text);

    expect(result).toEqual('Hello, &#039;world&#039;');
  });
});
