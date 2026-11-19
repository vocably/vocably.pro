import {
  parseSeoLanguagePair,
  SeoLanguagePair,
} from '@vocably/model-operations';
import { renderSeoPage } from './renderSeoPage';
import { SeoPage } from './searchData';

export type SeoPageSources = {
  getTemplate: () => Promise<string | null>;
  /**
   * The slug → page index of the pair's search data (see buildPageIndex).
   * Resolves to null when the pair has no search data.
   */
  getPageIndex: (pair: SeoLanguagePair) => Promise<Map<string, SeoPage> | null>;
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

  const [, pairString, slug] = match;
  const pair = parseSeoLanguagePair(pairString);

  if (pair === undefined) {
    return { found: false, reason: `Unknown language pair ${pairString}` };
  }

  const pageIndex = await sources.getPageIndex(pair);

  if (pageIndex === null) {
    return { found: false, reason: `No search data for ${pairString}` };
  }

  const page = pageIndex.get(slug);

  if (page === undefined) {
    return { found: false, reason: `${slug} isn't in the ${pairString} data` };
  }

  const templateHtml = await sources.getTemplate();

  if (templateHtml === null) {
    throw new Error('The search page template is missing');
  }

  return {
    found: true,
    html: await renderSeoPage({ templateHtml, pair, ...page }),
  };
};
