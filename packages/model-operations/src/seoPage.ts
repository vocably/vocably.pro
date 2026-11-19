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

/**
 * The slug is lossy ("apple inc." and "apple-inc" share no slug, but "a bag"
 * and "a-bag" do), so a slug can only be resolved back to a word through the
 * word list.
 */
export const getSeoPageSlug = (
  word: string,
  sourceLanguage: GoogleLanguage
): string =>
  `${word} in ${trimLanguage(languageList[sourceLanguage])}`
    .toLowerCase()
    .replace(/\P{L}/gu, '-');

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
