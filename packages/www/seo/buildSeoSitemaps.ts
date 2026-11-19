import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import {
  getSeoPagePath,
  parseSeoLanguagePair,
  seoLanguagePairToString,
} from '@vocably/model-operations';
import { fetchSitemap } from './getExistingSeoSearchSitemap';

// The SEO search pages (/de-en/<word>-in-german.html) are rendered on demand
// by packages/seo-backend, so the build only lists them. Each language pair
// names the word list it's built from, relative to scripts/seo.
const seoDir = '../../scripts/seo';
const languagePairsFile = `${seoDir}/language-pairs.json`;

// The protocol allows 50,000 URLs per sitemap.
const maxUrlsPerSitemap = 45000;

const getSitemapFileName = (pair: string, index: number) =>
  `${pair}/sitemap${index === 0 ? '' : `-${index + 1}`}.xml`;

const generateSitemap = (
  entries: Array<{ loc: string; lastmod: string }>
): string => `<?xml version="1.0" encoding="UTF-8"?>
<urlset
      xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${entries
  .map(
    ({ loc, lastmod }) => `
<url>
  <loc>${loc}</loc>
  <lastmod>${lastmod}</lastmod>
  <priority>0.5</priority>
</url>
`
  )
  .join('')}
</urlset>
`;

const escapeXml = (str: string) =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

/** The lastmod of every deployed URL of the pair, across all its sitemaps. */
const getDeployedLastmods = async (
  deployedBaseUrl: string,
  pair: string
): Promise<Map<string, string>> => {
  const lastmods = new Map<string, string>();

  for (let index = 0; ; index++) {
    const entries = await fetchSitemap(
      `${deployedBaseUrl}/${getSitemapFileName(pair, index)}`
    );

    if (entries.length === 0) {
      return lastmods;
    }

    for (const { loc, lastmod } of entries) {
      lastmods.set(loc, lastmod);
    }
  }
};

/**
 * Writes dist/<pair>/sitemap.xml (and sitemap-2.xml etc. for long lists) for
 * every language pair. A page keeps the lastmod it was first published with:
 * its content changes are handled by CloudFront invalidation, not by the
 * build.
 */
export const buildSeoSitemaps = async (deployedBaseUrl: string) => {
  const languagePairs: Array<{
    sourceLanguage: string;
    targetLanguage: string;
    words: string;
  }> = JSON.parse(readFileSync(languagePairsFile, 'utf-8'));

  for (const languagePair of languagePairs) {
    const pairString = `${languagePair.sourceLanguage}-${languagePair.targetLanguage}`;
    const pair = parseSeoLanguagePair(pairString);

    if (
      pair === undefined ||
      seoLanguagePairToString(pair) !== pairString ||
      pair.sourceLanguage !== languagePair.sourceLanguage
    ) {
      throw new Error(
        `${languagePairsFile}: unknown language pair ${pairString}`
      );
    }

    const words: string[] = JSON.parse(
      readFileSync(`${seoDir}/${languagePair.words}`, 'utf-8')
    );

    // Words whose slugs collide share a page.
    const paths = [
      ...new Set(
        words
          .filter((word) => typeof word === 'string' && word.trim() !== '')
          .map((word) => getSeoPagePath(word, pair))
      ),
    ];

    const deployedLastmods = await getDeployedLastmods(
      deployedBaseUrl,
      pairString
    );
    const now = new Date().toISOString();

    const entries = paths.map((path) => {
      const loc = `https://vocably.pro/${encodeURI(path)}`;
      return {
        loc: escapeXml(loc),
        // Sitemaps generated before the pages became dynamic listed
        // non-ASCII URLs unencoded.
        lastmod:
          deployedLastmods.get(loc) ||
          deployedLastmods.get(`https://vocably.pro/${path}`) ||
          now,
      };
    });

    for (let i = 0; i * maxUrlsPerSitemap < entries.length; i++) {
      const fileName = `./dist/${getSitemapFileName(pairString, i)}`;
      mkdirSync(dirname(fileName), { recursive: true });
      writeFileSync(
        fileName,
        generateSitemap(
          entries.slice(i * maxUrlsPerSitemap, (i + 1) * maxUrlsPerSitemap)
        )
      );
    }

    console.log(`${pairString}: ${entries.length} SEO pages in the sitemap`);
  }
};
