import { describe, expect, it } from '@jest/globals';
import { buildTranslationCards } from './buildTranslationCards';
import { DataSource, recordAccess } from './dataSource';

const memoryDataSource = (files: Record<string, string>): DataSource => ({
  read: async (key) => files[key] ?? null,
  list: async (prefix) =>
    Object.keys(files).filter((key) => key.startsWith(prefix)),
});

const analysis = (source: string, extra: Record<string, unknown> = {}) =>
  JSON.stringify({
    source,
    definitions: [`definition of ${source}`],
    examples: [`example of ${source}`],
    lemma: source,
    lemmaPos: 'noun',
    synonyms: [],
    transcript: '',
    number: 'singular',
    ...extra,
  });

const pair = { sourceLanguage: 'de', targetLanguage: 'en' } as const;

describe('buildTranslationCards', () => {
  it('builds items from reverse translations, analyses and translations', async () => {
    const dataSource = recordAccess(
      memoryDataSource({
        '_reverse-translations/de/en/apple.json': JSON.stringify([
          {
            source: 'apple',
            target: 'Apfel',
            sourceLanguage: 'en',
            targetLanguage: 'de',
            partOfSpeech: 'noun',
          },
        ]),
        '_reverse-translations/de/en/apple/word.json': JSON.stringify([
          {
            source: 'apple',
            target: 'Äpfel',
            sourceLanguage: 'en',
            targetLanguage: 'de',
            partOfSpeech: 'noun',
            lemma: 'Apfel',
            lemmaPos: 'noun',
          },
        ]),
        'de/units-of-speech/apfel/noun.json': analysis('Apfel', {
          gender: 'masculine',
        }),
        'de/translations/apfel/noun/en.txt': 'apple\npome\n',
        'de/units-of-speech/äpfel/noun.json': analysis('Äpfel'),
        // Only a British English translation exists.
        'de/translations/äpfel/noun/en-gb.txt': '["apples"]',
      })
    );

    const cards = await buildTranslationCards(dataSource, 'apple', pair);

    expect(cards?.source).toEqual('apple');
    expect(cards?.sourceLanguage).toEqual('de');
    expect(cards?.targetLanguage).toEqual('en');
    expect(
      cards?.items.map(({ source, translation, partOfSpeech }) => ({
        source,
        translation,
        partOfSpeech,
      }))
    ).toEqual([
      { source: 'der Apfel', translation: 'apple, pome', partOfSpeech: 'noun' },
      { source: 'Äpfel', translation: 'apples', partOfSpeech: 'noun' },
    ]);

    // Missing keys are dependencies too: the page changes once they appear.
    expect([...dataSource.accessedKeys]).toEqual(
      expect.arrayContaining([
        '_reverse-translations/de/en/apple.json',
        '_reverse-translations/de/en/apple/',
        'de/units-of-speech/apfel/noun.json',
        'de/translations/apfel/noun/en.txt',
        'de/translations/äpfel/noun/en.txt',
        'de/translations/äpfel/noun/en-gb.txt',
      ])
    );
  });

  it('skips units of speech that do not exist or have no translations', async () => {
    const dataSource = memoryDataSource({
      '_reverse-translations/de/en/ghost.json': JSON.stringify([
        {
          source: 'ghost',
          target: 'Gespenst',
          sourceLanguage: 'en',
          targetLanguage: 'de',
          partOfSpeech: 'noun',
        },
        {
          source: 'ghost',
          target: 'Geist',
          sourceLanguage: 'en',
          targetLanguage: 'de',
          partOfSpeech: 'noun',
        },
      ]),
      'de/units-of-speech/gespenst/noun.json': analysis('Gespenst', {
        exists: false,
      }),
      'de/translations/gespenst/noun/en.txt': 'ghost',
      'de/units-of-speech/geist/noun.json': analysis('Geist'),
    });

    expect(
      await buildTranslationCards(dataSource, 'ghost', pair)
    ).toBeUndefined();
  });

  it('resolves to undefined without reverse translations', async () => {
    expect(
      await buildTranslationCards(memoryDataSource({}), 'nothing', pair)
    ).toBeUndefined();
  });
});
