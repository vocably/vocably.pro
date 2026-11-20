import { TranslationCards } from '@vocably/model';
import {
  SeoLanguagePair,
  seoLanguagePairToString,
} from '@vocably/model-operations';

// The search data of a page lives in the SEO bucket as
// <source>-<target>/<word slug>.json, e.g. de-en/a-bag.json for
// /de-en/a-bag-in-german.html, uploaded from
// packages/www/seo/search-data/<pair>.json (keyed by the same slug) by
// scripts/seo-upload-search-data.mts.
// It's keyed by the slug rather than by the word because the URL only carries
// the slug ("a bag" and "a-bag" share it).
export const getSearchDataKey = (pair: string, wordSlug: string) =>
  `${pair}/${wordSlug}.json`;

export const isTranslationCards = (data: unknown): data is TranslationCards =>
  typeof data === 'object' &&
  data !== null &&
  typeof (data as TranslationCards).source === 'string' &&
  Array.isArray((data as TranslationCards).items);

/** Reads an object of the SEO bucket; resolves to null when it's missing. */
export type ReadObject = (key: string) => Promise<string | null>;

/**
 * Loads the search data of one word through `readObject`: the S3 bucket in
 * the lambda, a mock of it backed by the local files in scripts/serve.mts.
 */
export const translationCardsLoader =
  (readObject: ReadObject) =>
  async (
    pair: SeoLanguagePair,
    wordSlug: string
  ): Promise<TranslationCards | null> => {
    const key = getSearchDataKey(seoLanguagePairToString(pair), wordSlug);
    const contents = await readObject(key);

    if (contents === null) {
      return null;
    }

    const data = JSON.parse(contents);

    if (!isTranslationCards(data)) {
      throw new Error(`${key} is not translation cards`);
    }

    return data;
  };
