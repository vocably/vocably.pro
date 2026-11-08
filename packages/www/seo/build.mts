#!/usr/bin/env -S npx vite-node

import { buildStaticSearchPages } from './buildStaticSearchPages';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { buildMainSitemap } from './buildMainSitemap';
import { buildSitemapIndex } from './buildSitemapIndex';
import { collectIndexNowUrls } from './indexNow';

const { environment } = createRequire(import.meta.url)('../environment.js');

const progressInterval = 1000;

const formatDuration = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${(ms / 1000).toFixed(1)}s`;
};

const startedAt = performance.now();
const elapsed = () => formatDuration(performance.now() - startedAt);

let compiledPages = 0;

// @ts-ignore
await buildStaticSearchPages({
  searchDataFolder: `./seo/${environment.searchSeoDataFolder}`,
  basePath: 'https://vocably.pro',
  deployedBaseUrl: environment.baseUrl,
  templateHtml: readFileSync('./dist/search.html', 'utf-8'),
  searchPageFileName: 'search.html',
  onPageCompiled: (count) => {
    compiledPages = count;
    if (count % progressInterval === 0) {
      console.log(`[${elapsed()}] ${count} pages compiled`);
    }
  },
});

console.log(`[${elapsed()}] ${compiledPages} pages compiled in total`);

buildMainSitemap();
await buildSitemapIndex();
await collectIndexNowUrls(environment.baseUrl);

console.log(`SEO build finished in ${elapsed()}`);
