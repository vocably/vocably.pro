import '@vocably/jest';
import { inspect } from '@vocably/node-sulna';
import { translateWithGemini } from './aiFetchPossibleTranslationGemini';
import { configureTestAnalyzer } from './test/configureTestAnalyzer';

configureTestAnalyzer();

describe('aiFetchPossibleTranslationGemini', () => {
  if (process.env.TEST_SKIP_SPEC === 'true') {
    it('skip spec testing', () => {});
    return;
  }

  it('a word that can have multiple translations', async () => {
    const result = await translateWithGemini({
      sourceLanguage: 'en',
      targetLanguage: 'nl',
      source: 'cover',
    });

    if (result.success === false) {
      throw 'Unexpected result';
    }

    console.log(inspect(result.value));

    expect(result.value.length).toBeGreaterThan(1);
  });

  it('follows the direction of translation', async () => {
    const result = await translateWithGemini({
      sourceLanguage: 'ru',
      targetLanguage: 'en',
      source: 'get along',
    });

    if (result.success === false) {
      throw 'Unexpected result';
    }

    console.log(inspect(result.value));

    expect(result.value.every((e) => /^[a-z ]+$/.test(e.target))).toEqual(true);
  });

  it('1 follows the direction of translation', async () => {
    const result = await translateWithGemini({
      sourceLanguage: 'en',
      targetLanguage: 'de',
      source: 'creative',
    });

    if (result.success === false) {
      throw 'Unexpected result';
    }

    console.log(inspect(result.value));

    expect(result.value.every((e) => /^[a-zö ]+$/.test(e.target))).toEqual(
      true
    );
  });

  it('fills in source and language fields', async () => {
    const result = await translateWithGemini({
      sourceLanguage: 'en',
      targetLanguage: 'nl',
      source: 'cover',
    });

    if (result.success === false) {
      throw result;
    }

    console.log(inspect(result.value));

    const variants =
      'deksel, cover, bedekking, omslag, bedekken, coveren, dekken, hoes, kaft, hoever, dekking, afdekken, omslaan, omvatten';

    expect(result.value[0].target).toHaveSomeOf(variants);
    expect(result.value[0].source).toEqual('cover');
    expect(result.value[0].sourceLanguage).toEqual('en');
    expect(result.value[0].targetLanguage).toEqual('nl');
  });

  it('strips "to" from English verbs', async () => {
    const result = await translateWithGemini({
      sourceLanguage: 'de',
      targetLanguage: 'en',
      source: 'laufen',
    });

    if (result.success === false) {
      throw result;
    }

    console.log(inspect(result.value));

    result.value
      .filter((e) => e.partOfSpeech === 'verb')
      .forEach((e) => {
        expect(e.target).not.toMatch(/^to /i);
      });
  });

  it('returns unique translations', async () => {
    const result = await translateWithGemini({
      sourceLanguage: 'en',
      targetLanguage: 'de',
      source: 'creative',
    });

    if (result.success === false) {
      throw result;
    }

    const keys = result.value.map((e) => e.target + e.partOfSpeech);
    expect(new Set(keys).size).toEqual(keys.length);
    expect(result.value.length).toBeLessThanOrEqual(6);
  });

  it('translates into Chinese with pinyin', async () => {
    const result = await translateWithGemini({
      sourceLanguage: 'en',
      targetLanguage: 'zh',
      source: 'Tuesday',
    });

    if (result.success === false) {
      throw result;
    }

    console.log(inspect(result.value));

    expect(result.value[0].target).toHaveSomeOf('星期二, 周二, 礼拜二');
    expect(result.value[0].transcript).toHaveSomeOf(
      "xīngqī èr, xīngqī'èr, xīngqīèr, zhōu èr, zhōu'èr, zhōuèr, xīng qī èr"
    );
  });
});
