#!/usr/bin/env -S npx vite-node

import { getPartsOfSpeechGeminiBatchItem } from '@vocably/analyze';
import { ChatGPTLanguage } from '@vocably/model';
import { config } from 'dotenv-flow';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';

config();

const language: ChatGPTLanguage = 'ko';

const words: string[] = JSON.parse(
  readFileSync('./data/ko-words.json').toString()
);

console.log(`Building a batch for ${words.length} ${language} words`);

const rows = words.map((source) =>
  getPartsOfSpeechGeminiBatchItem({
    source,
    language,
  })
);

mkdirSync('./data/batches', { recursive: true });

const fileName = `./data/batches/${language}-words-${Date.now()}.jsonl`;

writeFileSync(fileName, rows.map((r) => JSON.stringify(r)).join('\n'));

console.log(`Wrote ${rows.length} batch items to ${fileName}`);
