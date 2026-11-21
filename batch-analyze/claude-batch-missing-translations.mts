#!/usr/bin/env -S npx vite-node

import {
  getAnalyseCacheFileName,
  getClaudeTranslationBatchItem,
  getUnitOfSpeechTranslationFileName,
} from '@vocably/analyze';
import { config } from 'dotenv-flow';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import {
  claudePayloadsDir,
  type ClaudePayloads,
  claudeTranslateBatchPrefix,
  languagesDir,
  type TranslateUnitOfSpeechPayload,
} from './claude-utils.js';

config();

const sourceLanguage = 'es';
const targetLanguage = 'en';

const missingTranslationsFile =
  process.argv[2] ?? './data/missing-translations-es-en.json';

type MissingTranslation = {
  source: string;
  partOfSpeech: string;
};

const missingTranslations: MissingTranslation[] = JSON.parse(
  readFileSync(missingTranslationsFile).toString()
);

console.log(
  `Found ${missingTranslations.length} missing translations in ${missingTranslationsFile}`
);

const readAnalysis = (payload: TranslateUnitOfSpeechPayload): any => {
  const analysisFile = `${languagesDir}/${getAnalyseCacheFileName(payload)}`;

  if (!existsSync(analysisFile)) {
    return undefined;
  }

  try {
    return JSON.parse(readFileSync(analysisFile).toString());
  } catch (e) {
    console.error(`Unable to parse ${analysisFile}: ${e}`);
    return undefined;
  }
};

const rows = [];
const payloads: ClaudePayloads = {};
let skipped = 0;
let withoutAnalysis = 0;

for (const { source, partOfSpeech } of missingTranslations) {
  const payload: TranslateUnitOfSpeechPayload = {
    sourceLanguage,
    targetLanguage,
    partOfSpeech,
    source,
  };

  const translationFile = `${languagesDir}/${getUnitOfSpeechTranslationFileName(
    payload
  )}`;

  if (existsSync(translationFile)) {
    skipped++;
    continue;
  }

  const analysis = readAnalysis(payload);

  if (analysis) {
    payload.definitions = analysis.definitions;
    payload.examples = analysis.examples;
    payload.number = analysis.number;
  } else {
    withoutAnalysis++;
  }

  const item = getClaudeTranslationBatchItem(payload);

  // The list may contain duplicates.
  if (payloads[item.custom_id]) {
    skipped++;
    continue;
  }

  payloads[item.custom_id] = payload;
  rows.push(item);
}

const name = `${claudeTranslateBatchPrefix}${sourceLanguage}-${targetLanguage}-${Date.now()}`;

mkdirSync('./data/batches', { recursive: true });
mkdirSync(claudePayloadsDir, { recursive: true });

const batchFile = `./data/batches/${name}.jsonl`;

writeFileSync(batchFile, rows.map((r) => JSON.stringify(r)).join('\n'));
writeFileSync(`${claudePayloadsDir}/${name}.json`, JSON.stringify(payloads));

console.log(
  `Skipped ${skipped} already-translated or duplicate items. ${withoutAnalysis} items have no units-of-speech analysis.`
);
console.log(`Wrote ${rows.length} batch items to ${batchFile}`);
