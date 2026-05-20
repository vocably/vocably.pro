#!/usr/bin/env -S npx vite-node

import { buildStaticSearchPages } from './buildStaticSearchPages';
import { cpSync, readFileSync } from 'node:fs';
import { buildMainSitemap } from './buildMainSitemap';
import { buildSitemapIndex } from './buildSitemapIndex';

// @ts-ignore
await buildStaticSearchPages({
  searchDataFolder: './seo/search-data-prod',
  basePath: 'https://vocably.pro',
  templateHtml: readFileSync('./dist/search.html', 'utf-8'),
  searchPageFileName: 'search.html',
});

buildMainSitemap();
await buildSitemapIndex();
