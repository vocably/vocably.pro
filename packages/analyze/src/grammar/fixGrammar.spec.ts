import '@vocably/jest';
import { configureTestAnalyzer } from '../test/configureTestAnalyzer';
import { fixGrammar } from './fixGrammar';

configureTestAnalyzer();

describe('fixGrammar', () => {
  if (process.env.TEST_SKIP_SPEC === 'true') {
    it('skip spec testing', () => {});
    return;
  }

  it('corrects', async () => {
    const result = await fixGrammar({
      language: 'en',
      context: '',
      text: 'The cat sit on the mat.',
    });

    expect(result.success).toEqual(true);
    if (result.success === false) {
      return;
    }
    console.log(result.value);
    expect(result.value.text).toEqual('The cat sits on the mat.');
    expect(result.value.isCorrect).toEqual(false);
  });

  it('explains in other languages', async () => {
    const result = await fixGrammar({
      language: 'en',
      context: '',
      text: 'The cat sit on the mat.',
      explanationLanguage: 'ru',
    });

    expect(result.success).toEqual(true);
    if (result.success === false) {
      return;
    }
    console.log(result.value);
    expect(result.value.text).toEqual('The cat sits on the mat.');
    expect(result.value.isCorrect).toEqual(false);
  });

  it('ignores punctuation and capitalization', async () => {
    const result = await fixGrammar({
      language: 'en',
      context: '',
      text: 'my name is dima',
      explanationLanguage: 'en',
    });

    expect(result.success).toEqual(true);
    if (result.success === false) {
      return;
    }
    console.log(result.value);
    expect(result.value.text).toEqual('my name is dima');
    expect(result.value.isCorrect).toEqual(true);
  });
});
