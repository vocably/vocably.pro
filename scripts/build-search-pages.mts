#!/usr/bin/env -S npx vite-node

import { listFiles } from './utils.js';
import { readFileSync } from 'fs';
import { writeFileSync } from 'node:fs';

const files = await listFiles(
  '../../vocably-languages/de/translations/**/en.txt'
);

const words: Record<string, string[]> = {};

for (const englishFile of files) {
  const translations = readFileSync(englishFile).toString().split('\n');
  const word = englishFile.split('/').at(-3) as string;
  for (const translation of translations) {
    if (!words[translation]) {
      words[translation] = [];
    }

    if (!words[translation].includes(word)) {
      words[translation].push(word);
    }
  }
}

const searchHandlebars = readFileSync(
  '../packages/www/src/pages/search.handlebars',
  'utf-8'
);

for (const translation of Object.keys(words)) {
  writeFileSync(
    '../packages/www/src/pages/search/' +
      translation.replace(/[ \\\/]/g, '-') +
      '.handlebars',
    searchHandlebars,
    'utf-8'
  );
}
