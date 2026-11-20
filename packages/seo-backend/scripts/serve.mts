#!/usr/bin/env -S npx vite-node

// Serves the SEO pages locally the way the render lambda does in production.
// The www dev server (packages/www, port 8050) proxies /<pair>/*.html here.
//
// The search data goes through the same loader as in the lambda, but the S3
// bucket is mocked: a key such as de-en/a-bag.json is answered from
// packages/www/seo/search-data/de-en.json, which is keyed by word slug like
// the bucket. The file is read on every request, so edits to it show up on
// reload.
//
// The template is the search page served by the www dev server.

import { existsSync, readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { join, resolve } from 'node:path';
import { resolveSeoPage } from '../src/resolveSeoPage';
import { templateFileName } from '../src/renderSeoPage';
import { ReadObject, translationCardsLoader } from '../src/searchData';

const port = Number(process.env.PORT ?? 8060);
const wwwDevServer = process.env.WWW_DEV_SERVER ?? 'http://localhost:8050';
const searchDataDir = resolve(import.meta.dirname, '../../www/seo/search-data');

/** Stands in for reading s3://<SEO bucket>/<pair>/<word slug>.json. */
const readMockS3Object: ReadObject = async (key) => {
  const match = /^([^/]+)\/([^/]+)\.json$/.exec(key);

  if (match === null) {
    return null;
  }

  const [, pair, wordSlug] = match;
  const file = join(searchDataDir, `${pair}.json`);

  if (!existsSync(file)) {
    return null;
  }

  const searchData: Record<string, unknown> = JSON.parse(
    readFileSync(file, 'utf-8')
  );

  return Object.hasOwn(searchData, wordSlug)
    ? JSON.stringify(searchData[wordSlug])
    : null;
};

const getTranslationCards = translationCardsLoader(readMockS3Object);

console.log(`Mocking the SEO bucket with ${searchDataDir}`);

createServer(async (request, response) => {
  const path = new URL(request.url ?? '/', 'http://localhost').pathname;

  try {
    const result = await resolveSeoPage(path, {
      getTemplate: async () => {
        const templateResponse = await fetch(
          `${wwwDevServer}/${templateFileName}`
        );
        return templateResponse.ok ? templateResponse.text() : null;
      },
      getTranslationCards,
    });

    if (!result.found) {
      console.log(`404 ${path}: ${result.reason}`);
      response.writeHead(404, { 'Content-Type': 'text/plain' });
      response.end(result.reason);
      return;
    }

    console.log(`200 ${path}`);
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(result.html);
  } catch (error) {
    console.error(`500 ${path}`, error);
    response.writeHead(500, { 'Content-Type': 'text/plain' });
    response.end(String(error));
  }
}).listen(port, () => {
  console.log(
    `SEO pages: http://localhost:${port}, e.g. via ${wwwDevServer}/de-en/apple-in-german.html`
  );
});
