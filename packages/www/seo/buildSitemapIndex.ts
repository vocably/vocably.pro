import { readFileSync, writeFileSync } from 'node:fs';
import { XMLParser } from 'fast-xml-parser';
import { listFiles } from './utils';

const getLastmod = (xmlContent: string): string | undefined => {
  const parser = new XMLParser();
  const parsed = parser.parse(xmlContent);
  const urls = parsed?.urlset?.url;
  if (!urls) return undefined;
  const entries = Array.isArray(urls) ? urls : [urls];
  const dates = entries.map((u) => u.lastmod).filter(Boolean);
  return dates.sort().at(-1);
};

const generateSitemapIndex = (
  sitemaps: Array<{ loc: string; lastmod?: string }>
): string => {
  const items = sitemaps
    .map(({ loc, lastmod }) =>
      lastmod
        ? `\n<sitemap>\n  <loc>${loc}</loc>\n  <lastmod>${lastmod}</lastmod>\n</sitemap>`
        : `\n<sitemap>\n  <loc>${loc}</loc>\n</sitemap>`
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${items}\n</sitemapindex>\n`;
};

export const buildSitemapIndex = async () => {
  const outputPath = 'dist/sitemap.xml';
  const files = (await listFiles('./dist/**/sitemap*.xml')).filter(
    (f) => f.replace(/^\.\//, '') !== outputPath
  );

  const sitemaps = files.map((file) => {
    const content = readFileSync(file, 'utf-8');
    const loc = `https://vocably.pro/${file.replace(/^(?:\.\/)?dist\//, '')}`;
    const lastmod = getLastmod(content);
    return { loc, lastmod };
  });

  writeFileSync('./dist/sitemap.xml', generateSitemapIndex(sitemaps));
};
