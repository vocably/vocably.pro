import { inspect } from '@vocably/node-sulna';
import { batchUnitOfSpeechAnalyse } from './batchUnitOfSpeechAnalyse';
import { configureTestAnalyzer } from './test/configureTestAnalyzer';

configureTestAnalyzer();

describe('buildBulkAnalysisResult', () => {
  jest.setTimeout(30000);

  if (process.env.TEST_SKIP_SPEC === 'true') {
    it('skip spec testing', () => {});
    return;
  }

  it('works', async () => {
    const result = await batchUnitOfSpeechAnalyse({
      sourceLanguage: 'en',
      targetLanguage: 'ru',
      unitsOfSpeech: [
        {
          headword: 'look up',
          partOfSpeech: 'phrasal verb',
        },
        { headword: 'give up', partOfSpeech: 'phrasal verb' },
      ],
    });

    console.log(inspect(result));

    expect(result.items.length).toEqual(2);
    expect(result.failed.length).toEqual(0);
  });
});
