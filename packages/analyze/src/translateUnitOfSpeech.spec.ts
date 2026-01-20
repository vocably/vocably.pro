import '@vocably/jest';
import { configureTestAnalyzer } from './test/configureTestAnalyzer';
import {
  getFileName,
  translateUnitOfSpeechChatGpt,
  translateUnitOfSpeechGemini,
  translateUnitOfSpeechNoCache,
} from './translateUnitOfSpeech';

configureTestAnalyzer();

describe('translateUnitOfSpeech', () => {
  if (process.env.TEST_SKIP_SPEC === 'true') {
    it('skip spec testing', () => {});
    return;
  }

  it('gemini bank', async () => {
    const translationResult = await translateUnitOfSpeechGemini({
      source: 'bank',
      partOfSpeech: 'noun',
      sourceLanguage: 'en',
      targetLanguage: 'ru',
      definitions: [
        'A financial institution where money and other valuables are stored and managed.',
        'A long, raised mass or mound of earth, especially bordering or paralleling a river or shore.',
        'A set or series of similar or related things, particularly in a row or tier.',
      ],
    });

    if (translationResult.success === false) {
      console.log(translationResult);
      //@ts-ignore
      expect(translationResult.success).toEqual(true);
      return;
    }

    expect(translationResult.value[0]).toEqual('банк');
    expect(translationResult.value[1]).toEqual('берег');
  }, 60_000);

  it('chatgpt bank', async () => {
    const translationResult = await translateUnitOfSpeechChatGpt({
      source: 'bank',
      partOfSpeech: 'noun',
      sourceLanguage: 'en',
      targetLanguage: 'ru',
      definitions: [
        'A financial institution where money and other valuables are stored and managed.',
        'A long, raised mass or mound of earth, especially bordering or paralleling a river or shore.',
        'A set or series of similar or related things, particularly in a row or tier.',
      ],
    });
    expect(translationResult.success).toEqual(true);

    if (translationResult.success === false) {
      return;
    }

    expect(translationResult.value[0]).toEqual('банк');
    expect(translationResult.value[1]).toEqual('берег');
  }, 60_000);

  it('bank', async () => {
    const translationResult = await translateUnitOfSpeechNoCache({
      source: 'bank',
      partOfSpeech: 'noun',
      sourceLanguage: 'en',
      targetLanguage: 'ru',
    });
    expect(translationResult.success).toEqual(true);
    if (translationResult.success === false) {
      return;
    }

    expect(translationResult.value[0]).toEqual('банк');
    expect(translationResult.value[1]).toEqual('берег');
  }, 60_000);

  it('trims article before translation', async () => {
    const translationResult = await translateUnitOfSpeechNoCache({
      source: 'het pad',
      partOfSpeech: 'noun',
      sourceLanguage: 'nl',
      targetLanguage: 'en',
      definitions: [
        'Een smalle weg voor wandelaars of fietsers.',
        'Een traject of koers die men volgt.',
        'Een amfibie uit de familie Bufonidae.',
      ],
    });
    expect(translationResult.success).toEqual(true);
    if (translationResult.success === false) {
      return;
    }

    console.log(translationResult.value);

    expect(translationResult.value.every((v) => !v.startsWith('the'))).toEqual(
      true
    );
  }, 60_000);

  it('tailor', async () => {
    const translationResult = await translateUnitOfSpeechNoCache({
      source: 'tailor',
      partOfSpeech: 'verb',
      sourceLanguage: 'en',
      targetLanguage: 'ru',
    });

    console.log(translationResult);

    expect(translationResult.success).toEqual(true);

    if (!translationResult.success) {
      return;
    }

    // @ts-ignore
    expect(translationResult.value[0]).toEqual('шить');
  }, 60_000);

  it('de bron to en', async () => {
    const translationResult = await translateUnitOfSpeechNoCache({
      source: 'bron',
      partOfSpeech: 'noun',
      sourceLanguage: 'nl',
      targetLanguage: 'en',
    });
    expect(translationResult.success).toEqual(true);
    // @ts-ignore
    expect(translationResult.value[0]).toEqual('source');
  }, 60_000);

  it('de bron to ru', async () => {
    const translationResult = await translateUnitOfSpeechNoCache({
      source: 'bron',
      partOfSpeech: 'noun',
      sourceLanguage: 'nl',
      targetLanguage: 'ru',
    });
    expect(translationResult.success).toEqual(true);
    if (!translationResult.success) {
      return;
    }
    expect(translationResult.value.length).toBeGreaterThanOrEqual(2);
    // @ts-ignore
    expect(translationResult.value[0]).toEqual('источник');
    expect(translationResult.value[1]).toHaveSomeOf('источник, родник, ключ');
  }, 60_000);

  it('arrival', async () => {
    const translationResult = await translateUnitOfSpeechNoCache({
      source: 'arrival',
      partOfSpeech: 'noun',
      sourceLanguage: 'en',
      targetLanguage: 'ru',
    });
    expect(translationResult.success).toEqual(true);
    if (!translationResult.success) {
      return;
    }
    expect(translationResult.value.length).toBeGreaterThanOrEqual(2);
    expect(translationResult.value[0]).toEqual('прибытие');
    expect(translationResult.value[1]).toEqual('приезд');
  }, 60_000);

  it('bottle', async () => {
    const translationResult = await translateUnitOfSpeechNoCache({
      source: 'bottle',
      partOfSpeech: 'noun',
      sourceLanguage: 'en',
      targetLanguage: 'ru',
    });
    expect(translationResult.success).toEqual(true);
    if (!translationResult.success) {
      return;
    }
    expect(translationResult.value.length).toBeGreaterThanOrEqual(2);
    // @ts-ignore
    expect(translationResult.value[0]).toEqual('бутылка');
  }, 60_000);

  it('past tense 01', async () => {
    const translationResult = await translateUnitOfSpeechNoCache({
      source: 'doet',
      partOfSpeech: 'verb',
      sourceLanguage: 'nl',
      targetLanguage: 'en',
      definitions: [
        'maakt iets tot werkelijkheid',
        'verricht een handeling',
        'functioneert op een specifieke manier',
      ],
    });
    expect(translationResult.success).toEqual(true);
    if (!translationResult.success) {
      return;
    }

    expect(translationResult.value[0]).toEqual('does');
  }, 60_000);

  it('past tense 02', async () => {
    const translationResult = await translateUnitOfSpeechNoCache({
      source: 'aangekondigd',
      partOfSpeech: 'verb',
      sourceLanguage: 'nl',
      targetLanguage: 'ru',
    });
    expect(translationResult.success).toEqual(true);
    if (!translationResult.success) {
      return;
    }

    expect(translationResult.value[0]).toHaveSomeOf([
      'объявленный',
      'объявлено',
      'объявил',
    ]);
  }, 60_000);

  describe('get file name', () => {
    it('replaces slashes', () => {
      expect(
        getFileName({
          source: 'some/wrong/file/name',
          sourceLanguage: 'en',
          partOfSpeech: 'noun/and/something/else',
          targetLanguage: 'nl',
        })
      ).toEqual(
        'en/translations/some-wrong-file-name/noun-and-something-else/nl.txt'
      );
    });

    it('works fine', () => {
      expect(
        getFileName({
          source: 'խնձոր',
          sourceLanguage: 'hy',
          partOfSpeech: 'noun',
          targetLanguage: 'en',
        })
      ).toEqual('hy/translations/խնձոր/noun/en.txt');
    });
  });

  it('gemeni properly translates duck', async () => {
    const translationResult = await translateUnitOfSpeechGemini({
      source: 'duck',
      partOfSpeech: 'verb',
      sourceLanguage: 'en',
      targetLanguage: 'ru',
      definitions: [
        'To lower the head or the body quickly to avoid a blow or so as not to be seen.',
        "To push someone's head under water.",
        'To quickly go somewhere, especially to avoid being seen.',
        'To avoid a duty, an unpleasant task, etc.',
      ],
    });

    expect(translationResult.success).toEqual(true);
    if (!translationResult.success) {
      return;
    }

    expect(
      translationResult.value.some((v) => v.includes('пригибаться'))
    ).toEqual(true);

    expect(translationResult.value.some((v) => v.includes('утка'))).toEqual(
      false
    );
  });

  it('gemini avoids insane tranlations', async () => {
    const translationResult = await translateUnitOfSpeechGemini({
      source: 'afslaan',
      partOfSpeech: 'verb',
      sourceLanguage: 'nl',
      targetLanguage: 'en',
      definitions: ['van richting veranderen', 'weigeren', 'niet accepteren'],
    });

    expect(translationResult.success).toEqual(true);
    if (!translationResult.success) {
      return;
    }

    expect(translationResult.value.length).not.toBeGreaterThanOrEqual(10);
  });

  it('chatgpt properly translates duck', async () => {
    const translationResult = await translateUnitOfSpeechChatGpt({
      source: 'duck',
      partOfSpeech: 'verb',
      sourceLanguage: 'en',
      targetLanguage: 'ru',
      definitions: [
        'to lower the head or body quickly to avoid being hit or seen',
        'to evade or avoid a task, responsibility, or difficult situation',
      ],
    });

    expect(translationResult.success).toEqual(true);
    if (!translationResult.success) {
      return;
    }

    expect(
      translationResult.value.some((v) => v.includes('пригнуться'))
    ).toEqual(true);

    expect(translationResult.value.some((v) => v.includes('утка'))).toEqual(
      false
    );
  });
});
