import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import {
  getSeoPagePath,
  parseSeoLanguagePair,
  seoLanguagePairToString,
} from '@vocably/model-operations';
import { TranslationCards } from '@vocably/model';
import { fetchSitemap } from './getExistingSeoSearchSitemap';

// The SEO search pages (/de-en/<word>-in-german.html) are rendered on demand
// by packages/seo-backend from seo/search-data/<pair>.json, so the build only
// lists them. Every file in that folder is a language pair.
export const searchDataFolder = './seo/search-data';

// Bump to give every page a new lastmod, e.g. after a change of the page
// layout that search engines should pick up.
const globalVersion = 3;

const escapeXml = (str: string) =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

// Kept identical to the hash of the build-time renderer, so the pages keep
// the lastmod they were published with. The word is the one the page shows,
// not the slug the search data is keyed by.
const getPageHash = (translationCards: TranslationCards) =>
  createHash('sha256')
    .update(
      JSON.stringify(
        JSON.stringify({
          word: translationCards.source,
          translationCards,
          globalVersion,
        })
      )
    )
    .digest('hex');

// The page hash is kept in a comment, as a <hash> element is not part of the
// sitemap schema and fails validation. parseSitemap reads both forms.
const generateSitemap = (
  entries: Array<{ loc: string; lastmod: string; hash: string }>
): string => `<?xml version="1.0" encoding="UTF-8"?>
<urlset
      xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${entries
  .map(
    ({ loc, lastmod, hash }) => `
<url>
  <loc>${escapeXml(loc)}</loc>
  <lastmod>${lastmod}</lastmod>
  <priority>0.5</priority>
  <!-- hash:${hash} -->
</url>
`
  )
  .join('')}
</urlset>
`;

export const getSearchDataPairs = (): string[] =>
  readdirSync(searchDataFolder)
    .filter((file) => file.endsWith('.json'))
    .map((file) => file.replace(/\.json$/, ''));

/**
 * Writes dist/<pair>/sitemap.xml for every search data file. A page's lastmod
 * changes when its data changes, which is also when collectIndexNowUrls picks
 * it up for IndexNow.
 *
 * baseUrl is the origin of the environment being built (https://vocably.pro in
 * prod, https://dev.env.vocably.pro in dev, see www_base_url in
 * platform/locals.tf). It is both where the deployed sitemap is fetched from
 * and the origin of the listed pages.
 */
export const buildSeoSitemaps = async (baseUrl = 'https://vocably.pro') => {
  for (const pairString of getSearchDataPairs()) {
    const pair = parseSeoLanguagePair(pairString);

    if (pair === undefined || seoLanguagePairToString(pair) !== pairString) {
      throw new Error(
        `${searchDataFolder}/${pairString}.json: unknown language pair`
      );
    }

    const searchData: Record<string, TranslationCards> = JSON.parse(
      readFileSync(`${searchDataFolder}/${pairString}.json`, 'utf-8')
    );

    const deployed = new Map(
      (await fetchSitemap(`${baseUrl}/${pairString}/sitemap.xml`)).map(
        (entry) => [entry.loc, entry]
      )
    );
    const now = new Date().toISOString();

    // Keyed by word slug, one page each.
    const entries = Object.entries(searchData).map(
      ([wordSlug, translationCards]) => {
        const loc = `${baseUrl}/${getSeoPagePath(wordSlug, pair)}`;
        const hash = getPageHash(translationCards);
        const existing = deployed.get(loc);

        return {
          loc,
          hash,
          lastmod:
            existing && existing.hash === hash && existing.lastmod
              ? existing.lastmod
              : now,
        };
      }
    );

    mkdirSync(`./dist/${pairString}`, { recursive: true });
    writeFileSync(`./dist/${pairString}/sitemap.xml`, generateSitemap(entries));

    console.log(`${pairString}: ${entries.length} SEO pages in the sitemap`);
  }
};
