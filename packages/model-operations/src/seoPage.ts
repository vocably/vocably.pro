import { GoogleLanguage, isGoogleLanguage, languageList } from '@vocably/model';
import { trimLanguage } from '@vocably/sulna';

// SEO search pages live at /<source>-<target>/<word>-in-<language>.html, e.g.
// /de-en/apple-in-german.html: the German translations of the English "apple".

export type SeoLanguagePair = {
  sourceLanguage: GoogleLanguage;
  targetLanguage: GoogleLanguage;
};

export const seoLanguagePairToString = ({
  sourceLanguage,
  targetLanguage,
}: SeoLanguagePair): string => `${sourceLanguage}-${targetLanguage}`;

/**
 * Language codes may contain a hyphen themselves (pt-PT, zh-TW), so every
 * hyphen is tried as the separator.
 */
export const parseSeoLanguagePair = (
  pair: string
): SeoLanguagePair | undefined => {
  for (let i = pair.indexOf('-'); i !== -1; i = pair.indexOf('-', i + 1)) {
    const sourceLanguage = pair.slice(0, i);
    const targetLanguage = pair.slice(i + 1);

    if (isGoogleLanguage(sourceLanguage) && isGoogleLanguage(targetLanguage)) {
      return { sourceLanguage, targetLanguage };
    }
  }

  return undefined;
};

const slugify = (text: string): string =>
  text.toLowerCase().replace(/\P{L}/gu, '-');

/**
 * The word as it appears in the page URL ("a bag" → "a-bag"). It is lossy:
 * "a bag" and "a-bag" share it, so the search data of a page is stored under
 * this slug rather than under the word.
 */
export const getSeoWordSlug = (word: string): string => slugify(word);

/** The "-in-german" part of the page slug. */
export const getSeoLanguageSuffix = (sourceLanguage: GoogleLanguage): string =>
  slugify(` in ${trimLanguage(languageList[sourceLanguage])}`);

export const getSeoPageSlug = (
  word: string,
  sourceLanguage: GoogleLanguage
): string => getSeoWordSlug(word) + getSeoLanguageSuffix(sourceLanguage);

/**
 * The word slug of a page slug ("a-bag-in-german" → "a-bag"), or undefined
 * when the page slug doesn't end with the language of the pair.
 */
export const parseSeoPageSlug = (
  pageSlug: string,
  sourceLanguage: GoogleLanguage
): string | undefined => {
  const suffix = getSeoLanguageSuffix(sourceLanguage);

  return pageSlug.endsWith(suffix) && pageSlug.length > suffix.length
    ? pageSlug.slice(0, -suffix.length)
    : undefined;
};

/** The path of the page without the leading slash. */
export const getSeoPagePath = (word: string, pair: SeoLanguagePair): string =>
  `${seoLanguagePairToString(pair)}/${getSeoPageSlug(
    word,
    pair.sourceLanguage
  )}.html`;

export const getSeoPageName = (
  word: string,
  sourceLanguage: GoogleLanguage
): string => `"${word}" in ${trimLanguage(languageList[sourceLanguage])}`;
