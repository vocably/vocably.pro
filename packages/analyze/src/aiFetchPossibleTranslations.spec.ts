import '@vocably/jest';
import { inspect } from '@vocably/node-sulna';
import {
  aiFetchPossibleTranslations,
  aiFetchPossibleTranslationsCached,
  translateWithGemini,
  truncateText,
} from './aiFetchPossibleTranslations';
import { configureTestAnalyzer } from './test/configureTestAnalyzer';

configureTestAnalyzer();

describe('aiReverseTranslate', () => {
  if (process.env.TEST_SKIP_SPEC === 'true') {
    it('skip spec testing', () => {});
    return;
  }

  it('gets all the Dutch meanings of the word or phrase "cover"', async () => {
    const result = await aiFetchPossibleTranslations({
      source: 'cover',
      targetLanguage: 'nl',
      sourceLanguage: 'en',
    });

    if (result.success !== true) {
      expect(result.reason).toBeFalsy();
      return;
    }

    const variants =
      'deksel, cover, bedekking, omslag, bedekken, coveren, dekken, hoes, kaft, hoever, dekking, afdekken, omslaan';

    expect(result.value.length).toBeGreaterThanOrEqual(3);
    expect(result.value[0].target).toHaveSomeOf(variants);
    expect(result.value[1].target).toHaveSomeOf(variants);
    expect(result.value[2].target).toHaveSomeOf(variants);
  });

  it('gets all the Dutch meanings of the word or phrase "phone case"', async () => {
    const result = await aiFetchPossibleTranslations({
      source: 'phone case',
      targetLanguage: 'nl',
      sourceLanguage: 'en',
    });

    if (result.success !== true) {
      expect(result.reason).toBeFalsy();
      return;
    }

    expect(result.value[0].target).toHaveSomeOf([
      'telefoonhoes',
      'telefoonhoesje',
    ]);
    expect(result.value[0].source).toEqual('phone case');
    expect(result.value[1].target).toHaveSomeOf('telefooncase, telefoonhoes');
    expect(result.value[1].source).toEqual('phone case');
  });

  it('translates questions', async () => {
    const result = await aiFetchPossibleTranslations({
      source: 'Всё в силе?',
      targetLanguage: 'en',
      sourceLanguage: 'ru',
    });

    expect(result.success).toBeTruthy();

    if (!result.success) {
      return;
    }

    expect(result.value[0].target).toHaveSomeOf([
      'Is everything still valid?',
      'Is it still on?',
      'Is everything still in effect?',
      'Is everything in force?',
      'Is everything still on?',
      'Is everything in place?',
    ]);
  });

  it('translates from ukrainian to german', async () => {
    const result = await aiFetchPossibleTranslations({
      source: 'гостра їжа',
      targetLanguage: 'de',
      sourceLanguage: 'uk',
    });

    if (result.success !== true) {
      expect(result.reason).toBeFalsy();
      return;
    }

    console.log(result);

    expect(result.value.length).toBeGreaterThanOrEqual(1);
    expect(result.value[0].target).toHaveSomeOf([
      'scharfes Essen',
      'scharfe Speisen',
    ]);
  });

  describe('truncateText', () => {
    it('keeps all the punctuation but angle braces', () => {
      expect(truncateText('a, b, </cd>, >, <, something', 100)).toEqual(
        'a, b, /cd, , , something'
      );
    });

    it('truncates the string while keeping the punctuation', () => {
      expect(truncateText('a, b, c, d, e, f, g, h', 10)).toEqual('a, b, c, d');
    });
  });

  describe('pinyin', () => {
    it('chinese traditional', async () => {
      const result = await aiFetchPossibleTranslations({
        source: 'Tuesday',
        targetLanguage: 'zh-TW',
        sourceLanguage: 'ru',
      });

      if (result.success !== true) {
        expect(result.reason).toBeFalsy();
        return;
      }

      expect(result.value.length).toBeGreaterThanOrEqual(1);
      expect(result.value[0].transcript).toHaveSomeOf(
        "xīngqī èr, xīngqī'èr, zhōu èr, zhōu'èr, xīng qī èr"
      );
    });

    it('chinese simplified', async () => {
      const result = await aiFetchPossibleTranslations({
        source: 'Tuesday',
        targetLanguage: 'zh',
        sourceLanguage: 'ru',
      });

      if (result.success !== true) {
        expect(result.reason).toBeFalsy();
        return;
      }

      expect(result.value.length).toBeGreaterThanOrEqual(1);
      expect(result.value[0].transcript).toHaveSomeOf(
        "xīngqī èr, xīngqī'èr, xīng qī èr"
      );
    });
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

    expect(result.value.every((e) => /^[a-z ]+$/.test(e.translation))).toEqual(
      true
    );
  });

  it('cached', async () => {
    const result = await aiFetchPossibleTranslationsCached({
      source: 'cover',
      targetLanguage: 'nl',
      sourceLanguage: 'en',
    });

    if (result.success !== true) {
      expect(result.reason).toBeFalsy();
      return;
    }

    const variants =
      'deksel, cover, bedekking, omslag, bedekken, coveren, dekken, hoes, kaft, hoever, dekking, afdekken, omslaan';

    expect(result.value.length).toBeGreaterThanOrEqual(3);
    expect(result.value[0].target).toHaveSomeOf(variants);
    expect(result.value[1].target).toHaveSomeOf(variants);
    expect(result.value[2].target).toHaveSomeOf(variants);
  });
});
