#!/usr/bin/env -S npx vite-node

// Usage: ./claude-batch-reverse-translations.mts en-de
// where the argument is {sourceLanguage}-{targetLanguage}
// and ../scripts/seo/{sourceLanguage}-{targetLanguage}.json is the list of source words.

import { getClaudeTranslateBatchItem } from '@vocably/analyze';
import { isGoogleLanguage } from '@vocably/model';
import { config } from 'dotenv-flow';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import {
  claudePayloadsDir,
  claudeReverseTranslateBatchPrefix,
  type ClaudeReverseTranslatePayloads,
  getReverseTranslationFileName,
  type ReverseTranslatePayload,
  seoWordListsDir,
} from './claude-utils.js';

config();

const direction = process.argv[2];
const [sourceLanguage, targetLanguage] = direction?.split('-') ?? [];

if (
  !sourceLanguage ||
  !targetLanguage ||
  !isGoogleLanguage(sourceLanguage) ||
  !isGoogleLanguage(targetLanguage)
) {
  console.error(
    'Usage: claude-batch-reverse-translations.mts {sourceLanguage}-{targetLanguage}, e.g. en-de'
  );
  process.exit(1);
}

const wordListFile = `${seoWordListsDir}/${sourceLanguage}-${targetLanguage}.json`;

if (!existsSync(wordListFile)) {
  console.error(`Word list ${wordListFile} does not exist.`);
  process.exit(1);
}

const sources: string[] = JSON.parse(readFileSync(wordListFile).toString());

console.log(`Found ${sources.length} words in ${wordListFile}`);

const rows = [];
const payloads: ClaudeReverseTranslatePayloads = {};
let existing = 0;
let duplicates = 0;

for (const source of sources) {
  const payload: ReverseTranslatePayload = {
    source,
    sourceLanguage,
    targetLanguage,
  };

  if (existsSync(getReverseTranslationFileName(payload))) {
    existing++;
    continue;
  }

  const item = getClaudeTranslateBatchItem(payload);

  if (payloads[item.custom_id]) {
    duplicates++;
    continue;
  }

  payloads[item.custom_id] = payload;
  rows.push(item);
}

console.log(
  `Skipped ${existing} existing and ${duplicates} duplicate reverse translations.`
);

if (rows.length === 0) {
  console.log('Nothing to translate.');
  process.exit(0);
}

const name = `${claudeReverseTranslateBatchPrefix}${sourceLanguage}-${targetLanguage}-${Date.now()}`;

mkdirSync('./data/batches', { recursive: true });
mkdirSync(claudePayloadsDir, { recursive: true });

const batchFile = `./data/batches/${name}.jsonl`;

writeFileSync(batchFile, rows.map((r) => JSON.stringify(r)).join('\n'));
writeFileSync(`${claudePayloadsDir}/${name}.json`, JSON.stringify(payloads));

console.log(`Wrote ${rows.length} batch items to ${batchFile}`);
