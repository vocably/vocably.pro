import { getSeoPageSlug, SeoLanguagePair } from '@vocably/model-operations';

/**
 * The word lists (scripts/seo/<words file>.json) are uploaded to the SEO
 * bucket under this key by Terraform.
 */
export const getWordsKey = (pair: string) => `words/${pair}.json`;

/**
 * Slugs are lossy, so pages are looked up by slug. When two words share a
 * slug the first one wins, which is also the one listed in the sitemap.
 */
export const buildWordIndex = (
  words: unknown,
  { sourceLanguage }: SeoLanguagePair
): Map<string, string> => {
  const index = new Map<string, string>();

  if (!Array.isArray(words)) {
    throw new Error('The word list must be a JSON array of strings');
  }

  for (const word of words) {
    if (typeof word !== 'string' || word.trim() === '') {
      continue;
    }

    const slug = getSeoPageSlug(word, sourceLanguage);

    if (!index.has(slug)) {
      index.set(slug, word);
    }
  }

  return index;
};
