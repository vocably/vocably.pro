#!/usr/bin/env -S npx vite-node

import {
  getGeminiTranslationBatchItem,
  getUnitOfSpeechTranslationFileName,
} from '@vocably/analyze';
import { GoogleLanguage } from '@vocably/model';
import { config } from 'dotenv-flow';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { listFiles } from './utils.js';

config();

const [sourceLanguage, targetLanguage] = process.argv.slice(2) as [
  GoogleLanguage,
  GoogleLanguage,
];

if (!sourceLanguage || !targetLanguage) {
  console.error(
    'Usage: ./batch-translate.mts <sourceLanguage> <targetLanguage>'
  );
  process.exit(1);
}

const languagesDir = '../../vocably-languages';
const unitsOfSpeechDir = `${languagesDir}/${sourceLanguage}/units-of-speech`;

const unitsOfSpeechFiles = await listFiles(unitsOfSpeechDir);

console.log(
  `Found ${unitsOfSpeechFiles.length} ${sourceLanguage} units of speech`
);

const rows = [];
let skipped = 0;

for (const file of unitsOfSpeechFiles) {
  const [, partOfSpeechWithExtension] = file.split('/').slice(-2);
  const partOfSpeech = partOfSpeechWithExtension.replace('.json', '');

  let analysis: any;
  try {
    analysis = JSON.parse(readFileSync(file).toString());
  } catch (e) {
    console.error(`Unable to parse ${file}: ${e}`);
    continue;
  }

  if (analysis.exists === false) {
    continue;
  }

  const payload = {
    sourceLanguage,
    targetLanguage,
    partOfSpeech,
    source: analysis.source,
    definitions: analysis.definitions,
    examples: analysis.examples,
    number: analysis.number,
  };

  // Skip if the translation already exists locally.
  const translationFile = `${languagesDir}/${getUnitOfSpeechTranslationFileName(
    payload
  )}`;

  if (existsSync(translationFile)) {
    skipped++;
    continue;
  }

  rows.push(getGeminiTranslationBatchItem(payload));
}

mkdirSync('./data/batches', { recursive: true });

const fileName = `./data/batches/translate-${sourceLanguage}-${targetLanguage}-${Date.now()}.jsonl`;

writeFileSync(fileName, rows.map((r) => JSON.stringify(r)).join('\n'));

console.log(
  `Skipped ${skipped} already-translated units. Wrote ${rows.length} batch items to ${fileName}`
);
