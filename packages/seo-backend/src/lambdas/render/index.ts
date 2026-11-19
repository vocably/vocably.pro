import {
  parseSeoLanguagePair,
  SeoLanguagePair,
  seoLanguagePairToString,
} from '@vocably/model-operations';
import { createHash } from 'node:crypto';
import { assertValidTemplate, templateFileName } from '../../renderSeoPage';
import { resolveSeoPage } from '../../resolveSeoPage';
import { cachedS3Object } from '../../s3';
import { buildPageIndex, getSearchDataKey, SeoPage } from '../../searchData';

// Serves /<pair>/<word>-in-<language>.html through a Lambda function URL that
// CloudFront uses as an origin. The page is built from the precomputed search
// data (packages/www/seo/search-data/<pair>.json) and the search page
// template, both of which only change with a deploy. CloudFront keeps the
// page until the www deploy invalidates "/*".

const seoBucket = process.env.SEO_BUCKET as string;
const wwwBucket = process.env.WWW_BUCKET as string;

const getTemplate = cachedS3Object(wwwBucket, templateFileName, (html) => {
  assertValidTemplate(html);
  return html;
});

const pageIndexLoaders = new Map<
  string,
  () => Promise<Map<string, SeoPage> | null>
>();

// Search data is loaded per pair on first use, so adding pairs doesn't slow
// down the others.
const getPageIndex = (pair: SeoLanguagePair) => {
  const pairString = seoLanguagePairToString(pair);
  let loader = pageIndexLoaders.get(pairString);

  if (!loader) {
    loader = cachedS3Object(seoBucket, getSearchDataKey(pairString), (json) =>
      buildPageIndex(JSON.parse(json), pair)
    );
    pageIndexLoaders.set(pairString, loader);
  }

  return loader();
};

// The browser revalidates on every visit (the ETag makes that a 304 from the
// edge), while CloudFront keeps the page until it's invalidated.
const cacheUntilInvalidated =
  'public, max-age=0, must-revalidate, s-maxage=31536000';
// The 404 is replaced by /404.html in CloudFront, which caches it for
// error_caching_min_ttl.
const cacheNotFound = 'public, max-age=0, s-maxage=300';

type FunctionUrlEvent = {
  rawPath: string;
  requestContext?: { http?: { method?: string } };
};

// Sent every 5 minutes by an EventBridge schedule (platform/seo.tf) with the
// pairs to load, so a warm container already holds the search data that a
// cold start would spend seconds downloading and parsing.
type WarmUpEvent = {
  warmUp: { pairs: string[] };
};

const isWarmUpEvent = (event: unknown): event is WarmUpEvent =>
  Array.isArray((event as WarmUpEvent | undefined)?.warmUp?.pairs);

const warmUp = async ({ warmUp: { pairs } }: WarmUpEvent) => {
  const startedAt = Date.now();

  await Promise.all([
    getTemplate(),
    ...pairs.map((pairString) => {
      const pair = parseSeoLanguagePair(pairString);

      if (pair === undefined) {
        throw new Error(`Unknown language pair: ${pairString}`);
      }

      return getPageIndex(pair);
    }),
  ]);

  console.log(`Warmed up ${pairs.join(', ')} in ${Date.now() - startedAt}ms`);
};

type FunctionUrlResult = {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
};

const respond = (
  statusCode: number,
  body: string,
  headers: Record<string, string>
): FunctionUrlResult => ({
  statusCode,
  headers: {
    'Content-Type': 'text/html; charset=utf-8',
    ...headers,
  },
  body,
});

export const handler = async (
  event: FunctionUrlEvent | WarmUpEvent
): Promise<FunctionUrlResult | void> => {
  if (isWarmUpEvent(event)) {
    return warmUp(event);
  }

  const method = event.requestContext?.http?.method ?? 'GET';

  if (method !== 'GET' && method !== 'HEAD') {
    return respond(405, 'Method Not Allowed', { Allow: 'GET, HEAD' });
  }

  try {
    const result = await resolveSeoPage(event.rawPath, {
      getTemplate,
      getPageIndex,
    });

    if (!result.found) {
      console.log(`404 ${event.rawPath}: ${result.reason}`);
      return respond(404, 'Not Found', { 'Cache-Control': cacheNotFound });
    }

    return respond(200, result.html, {
      'Cache-Control': cacheUntilInvalidated,
      ETag: `"${createHash('sha256')
        .update(result.html)
        .digest('hex')
        .slice(0, 32)}"`,
    });
  } catch (error) {
    console.error(`Unable to render ${event.rawPath}`, error);
    return respond(500, 'Internal Server Error', {
      'Cache-Control': 'no-store',
    });
  }
};
