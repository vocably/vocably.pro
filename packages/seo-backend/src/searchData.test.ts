import { describe, expect, it } from '@jest/globals';
import { TranslationCards } from '@vocably/model';
import { SeoLanguagePair } from '@vocably/model-operations';
import { resolveSeoPage, SeoPageSources } from './resolveSeoPage';
import { getSearchDataKey } from './searchData';

const requestedKeys: string[] = [];

const sources: SeoPageSources = {
  // Missing template blocks only matter once a page is found.
  getTemplate: async () => null,
  getTranslationCards: async (pair: SeoLanguagePair, wordSlug: string) => {
    requestedKeys.push(
      getSearchDataKey(
        `${pair.sourceLanguage}-${pair.targetLanguage}`,
        wordSlug
      )
    );
    return null as TranslationCards | null;
  },
};

describe('resolveSeoPage', () => {
  it('looks up the search data by the word slug of the URL', async () => {
    requestedKeys.length = 0;

    await resolveSeoPage('/de-en/a-bag-in-german.html', sources);
    await resolveSeoPage('/de-en/caf%C3%A9-in-german.html', sources);
    await resolveSeoPage('/de-en/apple-inc--in-german.html', sources);

    expect(requestedKeys).toEqual([
      'de-en/a-bag.json',
      'de-en/café.json',
      'de-en/apple-inc-.json',
    ]);
  });

  it('rejects paths that are not pages before reading any data', async () => {
    requestedKeys.length = 0;

    for (const path of [
      '/de-en/apple-in-french.html',
      '/de-en/Apple-in-german.html',
      '/de-en/-in-german.html',
      '/DE-en/apple-in-german.html',
      '/xx-en/apple-in-german.html',
      '/de-en/..%2Fapple-in-german.html',
      '/de-en/apple-in-german.htm',
      '/de-en/sub/apple-in-german.html',
    ]) {
      expect(await resolveSeoPage(path, sources)).toMatchObject({
        found: false,
      });
    }

    expect(requestedKeys).toEqual([]);
  });

  it('is not found when the word has no search data', async () => {
    expect(
      await resolveSeoPage('/de-en/notaword-in-german.html', sources)
    ).toMatchObject({ found: false });
  });
});
