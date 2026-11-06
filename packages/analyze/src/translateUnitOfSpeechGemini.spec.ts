import '@vocably/jest';
import { configureTestAnalyzer } from './test/configureTestAnalyzer';
import { translateUnitOfSpeechGemini } from './translateUnitOfSpeechGemini';

configureTestAnalyzer();

describe('translateUnitOfSpeechGemini', () => {
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
      examples: [
        'I deposited money in the bank.',
        'The river overflowed its banks.',
        'A bank of computers.',
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
      examples: [
        'She had to duck to avoid the ball.',
        'He ducked his brother in the pool.',
        'I ducked into the nearest doorway to escape the rain.',
        "He's always trying to duck his responsibilities.",
      ],
    });

    expect(translationResult.success).toEqual(true);
    if (!translationResult.success) {
      return;
    }

    console.log(translationResult.value);

    expect(
      translationResult.value.some(
        (v) =>
          v.includes('пригибаться') ||
          v.includes('пригнуться') ||
          v.includes('уклоняться')
      )
    ).toEqual(true);

    expect(translationResult.value.some((v) => v.includes('утка'))).toEqual(
      false
    );
  });

  it('gemeni consider plurals', async () => {
    const translationResult = await translateUnitOfSpeechGemini({
      source: 'balken',
      partOfSpeech: 'noun',
      sourceLanguage: 'nl',
      targetLanguage: 'ru',
      number: 'plural',
      definitions: [
        'Lange, zware stukken bewerkt hout, metaal of beton gebruikt in de bouw.',
        'Horizontale steunstukken in een constructie.',
      ],
    });

    expect(translationResult.success).toEqual(true);
    if (!translationResult.success) {
      return;
    }

    expect(translationResult.value[0]).toEqual('балки');
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
});
