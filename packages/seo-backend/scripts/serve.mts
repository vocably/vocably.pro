#!/usr/bin/env -S npx vite-node

// Serves the SEO pages locally the way the render lambda does in production.
// The www dev server (packages/www, port 8050) proxies /<pair>/*.html here.
//
// Data is read from local checkouts of the data repositories next to this
// one, or from S3 when UNITS_OF_SPEECH_BUCKET is set (needs AWS credentials).
// The template is the search page served by the www dev server.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { join, relative, resolve } from 'node:path';
import { DataSource } from '../src/dataSource';
import { resolveSeoPage } from '../src/resolveSeoPage';
import { templateFileName } from '../src/renderSeoPage';
import { buildWordIndex } from '../src/words';

const port = Number(process.env.PORT ?? 8060);
const wwwDevServer = process.env.WWW_DEV_SERVER ?? 'http://localhost:8050';
const rootDir = resolve(import.meta.dirname, '../../..');
const seoDir = join(rootDir, 'scripts/seo');
const languagesDir = resolve(
  process.env.VOCABLY_LANGUAGES_DIR ?? join(rootDir, '../vocably-languages')
);
const reverseTranslationsDir = resolve(
  process.env.VOCABLY_REVERSE_TRANSLATIONS_DIR ??
    join(rootDir, '../vocably-reverse-translations/data')
);

const reverseTranslationsPrefix = '_reverse-translations/';

const keyToPath = (key: string) =>
  key.startsWith(reverseTranslationsPrefix)
    ? join(reverseTranslationsDir, key.slice(reverseTranslationsPrefix.length))
    : join(languagesDir, key);

const listFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? listFiles(path) : [path];
  });

const fsDataSource: DataSource = {
  read: async (key) => {
    const path = keyToPath(key);
    return existsSync(path) && statSync(path).isFile()
      ? readFileSync(path, 'utf-8')
      : null;
  },
  list: async (prefix) => {
    const dir = keyToPath(prefix);
    if (!existsSync(dir) || !statSync(dir).isDirectory()) {
      return [];
    }
    return listFiles(dir).map((path) => prefix + relative(dir, path));
  },
};

const getDataSource = async (): Promise<DataSource> => {
  const bucket = process.env.UNITS_OF_SPEECH_BUCKET;

  if (!bucket) {
    console.log(
      `Reading data from ${languagesDir} and ${reverseTranslationsDir}`
    );
    return fsDataSource;
  }

  console.log(`Reading data from s3://${bucket}`);
  const { s3DataSource } = await import('../src/s3');
  return s3DataSource(bucket);
};

const languagePairs: Array<{
  sourceLanguage: string;
  targetLanguage: string;
  words: string;
}> = JSON.parse(readFileSync(join(seoDir, 'language-pairs.json'), 'utf-8'));

const dataSource = await getDataSource();

createServer(async (request, response) => {
  const path = new URL(request.url ?? '/', 'http://localhost').pathname;

  try {
    const result = await resolveSeoPage(path, {
      dataSource,
      getTemplate: async () => {
        const templateResponse = await fetch(
          `${wwwDevServer}/${templateFileName}`
        );
        return templateResponse.ok ? templateResponse.text() : null;
      },
      getWordIndex: async (pair) => {
        const languagePair = languagePairs.find(
          ({ sourceLanguage, targetLanguage }) =>
            sourceLanguage === pair.sourceLanguage &&
            targetLanguage === pair.targetLanguage
        );
        return languagePair
          ? buildWordIndex(
              JSON.parse(
                readFileSync(join(seoDir, languagePair.words), 'utf-8')
              ),
              pair
            )
          : null;
      },
    });

    if (!result.found) {
      console.log(`404 ${path}: ${result.reason}`);
      response.writeHead(404, { 'Content-Type': 'text/plain' });
      response.end(result.reason);
      return;
    }

    console.log(`200 ${path} (${result.dependencies.size} data keys)`);
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
