import { describe, expect, it } from '@jest/globals';
import { getAffectedDependencyKeys, getDependencyPrefix } from './dependencies';
import { getChangedKeys, toInvalidationPaths } from './lambdas/invalidate';
import { buildWordIndex } from './words';

describe('invalidation', () => {
  it('decodes the keys of S3 notifications delivered through SQS', () => {
    const body = (key: string) =>
      JSON.stringify({ Records: [{ s3: { object: { key } } }] });

    expect(
      getChangedKeys({
        Records: [
          { body: body('de/units-of-speech/%C3%A4pfel/noun.json') },
          { body: body('_reverse-translations/de/en/a+bag.json') },
          { body: JSON.stringify({ Event: 's3:TestEvent' }) },
          { body: 'not json' },
        ],
      })
    ).toEqual(
      new Set([
        'de/units-of-speech/äpfel/noun.json',
        '_reverse-translations/de/en/a bag.json',
      ])
    );
  });

  it('looks up the folder of a changed key as well', () => {
    expect(
      getAffectedDependencyKeys('_reverse-translations/de/en/apple/word.json')
    ).toEqual([
      '_reverse-translations/de/en/apple/word.json',
      '_reverse-translations/de/en/apple/',
    ]);
  });

  it('keeps dependency prefixes of different keys apart', () => {
    expect(getDependencyPrefix('de/units-of-speech/apfel/noun.json')).toEqual(
      'dependencies/de%2Funits-of-speech%2Fapfel%2Fnoun.json/'
    );
  });

  it('url-encodes paths and falls back to a wildcard for big batches', () => {
    expect(toInvalidationPaths(new Set(['de-en/café-in-german.html']))).toEqual(
      ['/de-en/caf%C3%A9-in-german.html']
    );

    const many = new Set(
      Array.from({ length: 501 }, (_, i) => `fr-en/word${i}-in-french.html`)
    );
    many.add('de-en/apple-in-german.html');

    expect(toInvalidationPaths(many)).toEqual([
      '/fr-en/*',
      '/de-en/apple-in-german.html',
    ]);
  });
});

describe('buildWordIndex', () => {
  it('maps slugs to words, keeping the first word of a shared slug', () => {
    const index = buildWordIndex(['a bag', 'a-bag', 'Über', 'apple inc.'], {
      sourceLanguage: 'de',
      targetLanguage: 'en',
    });

    expect([...index.entries()]).toEqual([
      ['a-bag-in-german', 'a bag'],
      ['über-in-german', 'Über'],
      ['apple-inc--in-german', 'apple inc.'],
    ]);
  });
});
