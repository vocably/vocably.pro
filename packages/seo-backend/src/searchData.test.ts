import { describe, expect, it } from '@jest/globals';
import { buildPageIndex } from './searchData';

const cards = (source: string) => ({ source, items: [{ source }] });

describe('buildPageIndex', () => {
  it('maps slugs to pages, keeping the last word of a shared slug', () => {
    const index = buildPageIndex(
      {
        'a bag': cards('a bag'),
        'a-bag': cards('a-bag'),
        café: cards('café'),
        'apple inc.': cards('apple inc.'),
        broken: { source: 'broken' },
      },
      { sourceLanguage: 'de', targetLanguage: 'en' }
    );

    expect(
      [...index.entries()].map(([slug, page]) => [slug, page.word])
    ).toEqual([
      ['a-bag-in-german', 'a-bag'],
      ['café-in-german', 'café'],
      ['apple-inc--in-german', 'apple inc.'],
    ]);
  });

  it('rejects data that is not an object of translation cards', () => {
    expect(() =>
      buildPageIndex([], { sourceLanguage: 'de', targetLanguage: 'en' })
    ).toThrow();
  });
});
