import {
  SeoLanguagePair,
  seoLanguagePairToString,
} from '@vocably/model-operations';
import { createHash } from 'node:crypto';
import { updatePageDependencies } from '../../dependencies';
import { assertValidTemplate, templateFileName } from '../../renderSeoPage';
import { resolveSeoPage } from '../../resolveSeoPage';
import { cachedS3Object, s3DataSource } from '../../s3';
import { buildWordIndex, getWordsKey } from '../../words';

// Serves /<pair>/<word>-in-<language>.html through a Lambda function URL that
// CloudFront uses as an origin. CloudFront keeps the page for a year; the
// invalidate lambda drops it when its data changes and the www deploy drops
// all of them when the template changes.

const unitsOfSpeechBucket = process.env.UNITS_OF_SPEECH_BUCKET as string;
const seoBucket = process.env.SEO_BUCKET as string;
const wwwBucket = process.env.WWW_BUCKET as string;

const getTemplate = cachedS3Object(wwwBucket, templateFileName, (html) => {
  assertValidTemplate(html);
  return html;
});

const wordIndexLoaders = new Map<
  string,
  () => Promise<Map<string, string> | null>
>();

const getWordIndex = (pair: SeoLanguagePair) => {
  const pairString = seoLanguagePairToString(pair);
  let loader = wordIndexLoaders.get(pairString);

  if (!loader) {
    loader = cachedS3Object(seoBucket, getWordsKey(pairString), (contents) =>
      buildWordIndex(JSON.parse(contents), pair)
    );
    wordIndexLoaders.set(pairString, loader);
  }

  return loader();
};

const dataSource = s3DataSource(unitsOfSpeechBucket);

// The browser revalidates on every visit (the ETag makes that a 304 from the
// edge), while CloudFront keeps the page until it's invalidated.
const cacheForever = 'public, max-age=0, must-revalidate, s-maxage=31536000';
// Pages whose dependencies couldn't be recorded can't be invalidated, so they
// expire on their own.
const cacheForADay = 'public, max-age=0, must-revalidate, s-maxage=86400';
// A word may get its data later. The 404 is replaced by /404.html in
// CloudFront, which caches it for error_caching_min_ttl.
const cacheNotFound = 'public, max-age=0, s-maxage=300';

type FunctionUrlEvent = {
  rawPath: string;
  requestContext?: { http?: { method?: string } };
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
  event: FunctionUrlEvent
): Promise<FunctionUrlResult> => {
  const method = event.requestContext?.http?.method ?? 'GET';

  if (method !== 'GET' && method !== 'HEAD') {
    return respond(405, 'Method Not Allowed', { Allow: 'GET, HEAD' });
  }

  try {
    const result = await resolveSeoPage(event.rawPath, {
      getTemplate,
      getWordIndex,
      dataSource,
    });

    if (!result.found) {
      console.log(`404 ${event.rawPath}: ${result.reason}`);
      return respond(404, 'Not Found', { 'Cache-Control': cacheNotFound });
    }

    let cacheControl = cacheForever;

    try {
      await updatePageDependencies(
        seoBucket,
        result.pagePath,
        result.dependencies
      );
    } catch (error) {
      console.error(
        `Unable to record the dependencies of ${result.pagePath}`,
        error
      );
      cacheControl = cacheForADay;
    }

    return respond(200, result.html, {
      'Cache-Control': cacheControl,
      ETag: `"${createHash('sha256').update(result.html).digest('hex').slice(0, 32)}"`,
    });
  } catch (error) {
    console.error(`Unable to render ${event.rawPath}`, error);
    return respond(500, 'Internal Server Error', {
      'Cache-Control': 'no-store',
    });
  }
};
