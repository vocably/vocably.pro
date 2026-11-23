import { XMLParser } from 'fast-xml-parser';

export type SitemapEntry = {
  loc: string;
  lastmod: string;
  priority: string;
  hash: string;
};

export const fetchSitemap = async (
  url: string
): Promise<Array<SitemapEntry>> => {
  const response = await fetch(url);

  // The sitemap doesn't exist before its first deploy.
  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw new Error(
      `Failed to fetch sitemap from ${url}: ${response.status} ${response.statusText}`
    );
  }

  return parseSitemap(await response.text());
};

const hashCommentPrefix = 'hash:';

// The hash is written as <!-- hash:<hash> --> (see buildSeoSitemaps), older
// sitemaps have it in a <hash> element.
const getHash = (entry: any): string => {
  const comments: unknown[] = [entry['#comment'] ?? []].flat();
  const hashComment = comments
    .map((comment) => String(comment).trim())
    .find((comment) => comment.startsWith(hashCommentPrefix));

  return hashComment
    ? hashComment.slice(hashCommentPrefix.length).trim()
    : String(entry.hash ?? '');
};

export const parseSitemap = (xmlText: string): Array<SitemapEntry> => {
  const parser = new XMLParser({
    commentPropName: '#comment',
    // Keep hashes like "0e12…" from being parsed as numbers.
    parseTagValue: false,
  });
  const parsed = parser.parse(xmlText);

  if (!parsed.urlset || !parsed.urlset.url) {
    throw new Error('Invalid sitemap format: missing urlset or url elements');
  }

  const urls = Array.isArray(parsed.urlset.url)
    ? parsed.urlset.url
    : [parsed.urlset.url];

  return urls.map((entry: any) => ({
    loc: entry.loc || '',
    lastmod: entry.lastmod || '',
    priority: entry.priority || '',
    hash: getHash(entry),
  }));
};
