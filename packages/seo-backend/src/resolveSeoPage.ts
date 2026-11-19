import {
  parseSeoLanguagePair,
  SeoLanguagePair,
} from '@vocably/model-operations';
import { buildTranslationCards } from './buildTranslationCards';
import { DataSource, recordAccess } from './dataSource';
import { renderSeoPage } from './renderSeoPage';

export type SeoPageSources = {
  getTemplate: () => Promise<string | null>;
  /**
   * The slug → word index of the pair's word list (see buildWordIndex).
   * Resolves to null when the pair has no word list.
   */
  getWordIndex: (pair: SeoLanguagePair) => Promise<Map<string, string> | null>;
  dataSource: DataSource;
};

export type SeoPageResult =
  | {
      found: true;
      /** The page path without the leading slash, e.g. de-en/apple-in-german.html */
      pagePath: string;
      html: string;
      /** The data keys the page was built from. */
      dependencies: Set<string>;
    }
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

  const [, pairString, slug] = match;
  const pair = parseSeoLanguagePair(pairString);

  if (pair === undefined) {
    return { found: false, reason: `Unknown language pair ${pairString}` };
  }

  const wordIndex = await sources.getWordIndex(pair);

  if (wordIndex === null) {
    return { found: false, reason: `No word list for ${pairString}` };
  }

  const word = wordIndex.get(slug);

  if (word === undefined) {
    return { found: false, reason: `${slug} isn't in the ${pairString} list` };
  }

  const dataSource = recordAccess(sources.dataSource);
  const translationCards = await buildTranslationCards(dataSource, word, pair);

  if (translationCards === undefined) {
    return { found: false, reason: `No data for "${word}" (${pairString})` };
  }

  const templateHtml = await sources.getTemplate();

  if (templateHtml === null) {
    throw new Error('The search page template is missing');
  }

  return {
    found: true,
    pagePath: `${pairString}/${slug}.html`,
    html: await renderSeoPage({ templateHtml, word, pair, translationCards }),
    dependencies: dataSource.accessedKeys,
  };
};
