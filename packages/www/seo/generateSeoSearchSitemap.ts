import { SitemapEntry } from './getExistingSeoSearchSitemap';

type Params = {
  existingSitemap: Array<SitemapEntry>;
  pages: Array<{
    loc: string;
    priority: string;
    hash: string;
  }>;
};

export const generateSeoSearchSitemap = ({
  pages,
  existingSitemap,
}: Params): string => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset
      xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${pages
  .map((page) => {
    const existingEntry = findExistingEntry(existingSitemap, page.loc);

    return {
      ...page,
      lastmod:
        !existingEntry ||
        existingEntry.hash !== page.hash ||
        !existingEntry.lastmod
          ? new Date().toISOString()
          : existingEntry.lastmod,
    };
  })
  .map(
    ({ loc, priority, lastmod, hash }) => `
<url>
  <loc>${loc}</loc>
  <lastmod>${lastmod}</lastmod>
  <priority>${priority}</priority>
  <hash>${hash}</hash>
</url>
`
  )
  .join('')}
</urlset>
`;
};

function findExistingEntry(
  existingSitemap: SitemapEntry[],
  loc: string
): SitemapEntry | undefined {
  return existingSitemap.find((entry) => entry.loc === loc);
}
