#!/usr/bin/env -S npx vite-node

// Serves the SEO pages locally the way the render lambda does in production.
// The www dev server (packages/www, port 8050) proxies /<pair>/*.html here.
//
// The search data is read from packages/www/seo/search-data and the template
// is the search page served by the www dev server.

import { existsSync, readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { join, resolve } from 'node:path';
import { seoLanguagePairToString } from '@vocably/model-operations';
import { resolveSeoPage } from '../src/resolveSeoPage';
import { templateFileName } from '../src/renderSeoPage';
import { buildPageIndex, SeoPage } from '../src/searchData';

const port = Number(process.env.PORT ?? 8060);
const wwwDevServer = process.env.WWW_DEV_SERVER ?? 'http://localhost:8050';
const searchDataDir = resolve(import.meta.dirname, '../../www/seo/search-data');

const pageIndexes = new Map<string, Map<string, SeoPage>>();

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
      getPageIndex: async (pair) => {
        const pairString = seoLanguagePairToString(pair);
        const file = join(searchDataDir, `${pairString}.json`);

        if (!existsSync(file)) {
          return null;
        }

        if (!pageIndexes.has(pairString)) {
          pageIndexes.set(
            pairString,
            buildPageIndex(JSON.parse(readFileSync(file, 'utf-8')), pair)
          );
        }

        return pageIndexes.get(pairString) ?? null;
      },
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
