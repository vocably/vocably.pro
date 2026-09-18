import { jest } from '@jest/globals';
import { inspect } from '@vocably/node-sulna';
import { buildBulkAnalysisResult } from './buildBulkAnalysisResult';
import { configureTestAnalyzer } from './test/configureTestAnalyzer';

configureTestAnalyzer();

describe('buildBulkAnalysisResult', () => {
  jest.setTimeout(30000);

  if (process.env.TEST_SKIP_SPEC === 'true') {
    it('skip spec testing', () => {});
    return;
  }

  it('returns the correct result', async () => {
    const result = await buildBulkAnalysisResult({
      sourceLanguage: 'en',
      sources: ['mother', 'incredible'],
    });

    console.log(inspect(result));
    expect(result.success).toBeTruthy();
    if (result.success === false) {
      return;
    }

    expect(result.value.analysis).toEqual([
      { source: 'mother', partOfSpeech: 'noun' },
      { source: 'incredible', partOfSpeech: 'adjective' },
    ]);
  });

  it('skips phrases', async () => {
    const result = await buildBulkAnalysisResult({
      sourceLanguage: 'en',
      sources: ['incredible', 'what is your name?'],
    });

    console.log(inspect(result));
    expect(result.success).toBeTruthy();
    if (result.success === false) {
      return;
    }

    expect(result.value.analysis).toEqual([
      { source: 'what is your name?', partOfSpeech: 'phrase' },
      { source: 'incredible', partOfSpeech: 'adjective' },
    ]);
  });

  it('is fine with only phrases', async () => {
    const result = await buildBulkAnalysisResult({
      sourceLanguage: 'en',
      sources: ['what is your name?'],
    });

    console.log(inspect(result));
    expect(result.success).toBeTruthy();
    if (result.success === false) {
      return;
    }

    expect(result.value.analysis).toEqual([
      { source: 'what is your name?', partOfSpeech: 'phrase' },
    ]);
  });
});
