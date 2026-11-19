#!/usr/bin/env -S npx vite-node

import { buildSeoSitemaps } from './buildSeoSitemaps';
import { createRequire } from 'node:module';
import { buildMainSitemap } from './buildMainSitemap';
import { buildSitemapIndex } from './buildSitemapIndex';
import { collectIndexNowUrls } from './indexNow';

const { environment } = createRequire(import.meta.url)('../environment.js');

const formatDuration = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${(ms / 1000).toFixed(1)}s`;
};

const startedAt = performance.now();
const elapsed = () => formatDuration(performance.now() - startedAt);

// @ts-ignore
await buildSeoSitemaps(environment.baseUrl);

buildMainSitemap();
await buildSitemapIndex();
await collectIndexNowUrls(environment.baseUrl);

console.log(`SEO build finished in ${elapsed()}`);
