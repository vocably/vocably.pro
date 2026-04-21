import '@vocably/jest';
import { configureTestAnalyzer } from './test/configureTestAnalyzer';
import { detectInputTypeS3 } from './detectInputTypeS3';

configureTestAnalyzer();

describe('detectInputTypeS3', () => {
  if (process.env.TEST_SKIP_SPEC === 'true') {
    it('skip spec testing', () => {});
    return;
  }

  it('works for words', async () => {
    const result = await detectInputTypeS3({
      language: 'en',
      source: 'table',
    });

    expect(result.success).toEqual(true);

    if (result.success === false) {
      return;
    }

    expect(result.value.type).toEqual('word');
    expect(result.value.isDirect).toEqual(true);
  });

  it('works for idioms', async () => {
    const result = await detectInputTypeS3({
      language: 'nl',
      source: 'aan mijn water voelen',
    });

    expect(result.success).toEqual(true);

    if (result.success === false) {
      return;
    }

    expect(result.value.type).toEqual('idiom');
    expect(result.value.isDirect).toEqual(true);
  });
});
