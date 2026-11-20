import { TranslationCards } from '@vocably/model';
import {
  getSeoWordSlug,
  parseSeoLanguagePair,
  parseSeoPageSlug,
  SeoLanguagePair,
  seoLanguagePairToString,
} from '@vocably/model-operations';
import { renderSeoPage } from './renderSeoPage';

export type SeoPageSources = {
  getTemplate: () => Promise<string | null>;
  /**
   * The search data of one word (see getSearchDataKey). Resolves to null when
   * there is none.
   */
  getTranslationCards: (
    pair: SeoLanguagePair,
    wordSlug: string
  ) => Promise<TranslationCards | null>;
};

export type SeoPageResult =
  | { found: true; html: string }
  | { found: false; reason: string };

const pathExpression = /^\/([^/]+)\/([^/]+)\.html$/;

const safeDecode = (path: string): string | undefined => {
  try {
    return decodeURIComponent(path);
  } catch {
    return undefined;
  }
};

export const resolveSeoPage = async (
  rawPath: string,
  sources: SeoPageSources
): Promise<SeoPageResult> => {
  const path = safeDecode(rawPath);
  const match = path === undefined ? null : pathExpression.exec(path);

  if (match === null) {
    return { found: false, reason: `Unexpected path ${rawPath}` };
  }

  const [, pairString, pageSlug] = match;
  const pair = parseSeoLanguagePair(pairString);

  // The canonical form only, so that e.g. /DE-en/ doesn't duplicate /de-en/.
  if (pair === undefined || seoLanguagePairToString(pair) !== pairString) {
    return { found: false, reason: `Unknown language pair ${pairString}` };
  }

  const wordSlug = parseSeoPageSlug(pageSlug, pair.sourceLanguage);

  // Rejects anything that isn't a slug before it becomes an S3 key, e.g.
  // /de-en/apple-in-french.html, upper case or "../".
  if (wordSlug === undefined || getSeoWordSlug(wordSlug) !== wordSlug) {
    return { found: false, reason: `Unexpected page ${pageSlug}` };
  }

  const [translationCards, templateHtml] = await Promise.all([
    sources.getTranslationCards(pair, wordSlug),
    sources.getTemplate(),
  ]);

  if (translationCards === null) {
    return {
      found: false,
      reason: `No search data for ${pairString}/${wordSlug}`,
    };
  }

  if (templateHtml === null) {
    throw new Error('The search page template is missing');
  }

  return {
    found: true,
    html: await renderSeoPage({
      templateHtml,
      pair,
      word: translationCards.source,
      translationCards,
    }),
  };
};
