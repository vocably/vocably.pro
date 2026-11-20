import { createHash } from 'node:crypto';
import { assertValidTemplate, templateFileName } from '../../renderSeoPage';
import { resolveSeoPage } from '../../resolveSeoPage';
import { cachedS3Object, readS3Object } from '../../s3';
import { translationCardsLoader } from '../../searchData';

// Serves /<pair>/<word>-in-<language>.html through a Lambda function URL that
// CloudFront uses as an origin. Each request reads the search data of its word
// from the SEO bucket (see searchData.ts) and renders it into the search page
// template. Both only change with a deploy, after which www_upload
// invalidates "/*", so CloudFront can keep the page until then.

const seoBucket = process.env.SEO_BUCKET as string;
const wwwBucket = process.env.WWW_BUCKET as string;

// The template is the same for every page, so it's kept between invocations
// (and revalidated by its ETag on each one).
const getTemplate = cachedS3Object(wwwBucket, templateFileName, (html) => {
  assertValidTemplate(html);
  return html;
});

const getTranslationCards = translationCardsLoader((key) =>
  readS3Object(seoBucket, key)
);

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

// Sent every few minutes by an EventBridge rule (see platform/seo.tf) to keep
// a container warm.
type WarmUpEvent = { warmUp: true };

const isWarmUpEvent = (event: unknown): event is WarmUpEvent =>
  (event as WarmUpEvent | undefined)?.warmUp === true;

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
    // Loading the template also opens the S3 connection and fills the
    // template cache that the next page request uses.
    await getTemplate();
    return;
  }

  const method = event.requestContext?.http?.method ?? 'GET';

  if (method !== 'GET' && method !== 'HEAD') {
    return respond(405, 'Method Not Allowed', { Allow: 'GET, HEAD' });
  }

  try {
    const result = await resolveSeoPage(event.rawPath, {
      getTemplate,
      getTranslationCards,
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
