import { analyseAndTranslate } from './analyseAndTranslate';
import { configureTestAnalyzer } from './test/configureTestAnalyzer';

configureTestAnalyzer();

describe('analyseAndTranslate', () => {
  jest.setTimeout(30000);

  if (process.env.TEST_SKIP_SPEC === 'true') {
    it('skip spec testing', () => {});
    return;
  }

  it('no [object]', async () => {
    const result = await analyseAndTranslate({
      source: 'state',
      sourceLanguage: 'en',
      targetLanguage: 'vi',
      partOfSpeech: 'noun',
    });

    expect(result.success).toEqual(true);

    if (result.success === false) {
      return;
    }

    expect(
      result.value.definitions.every((sentence) => /^.+\[.+\]$/.test(sentence))
    ).toEqual(false);

    expect(
      (result.value.examples ?? []).every((sentence) =>
        /^.+\[.+\]$/.test(sentence)
      )
    ).toEqual(false);
  });
});
