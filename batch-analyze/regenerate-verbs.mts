#!/usr/bin/env -S npx vite-node

import { getGeminiAnalyzeBatchItem } from '@vocably/analyze';
import { config } from 'dotenv-flow';
import { writeFileSync } from 'fs';
import 'zx/globals';
import { listFiles } from './utils.js';

config();

const language = 'en';

const langDir = `../../vocably-languages/${language}`;

const unitsOfSpeechFiles = await listFiles(langDir + '/units-of-speech');

let filesCount = 0;

console.log(`Found ${unitsOfSpeechFiles.length} files`);

let rows = [];

for (const file of unitsOfSpeechFiles) {
  const [source, partOfSpeechWithExtension] = file.split('/').slice(-2);
  const partOfSpeech = partOfSpeechWithExtension.replace('.json', '');

  filesCount++;

  console.log(`Processed ${filesCount} files`);

  if (!partOfSpeech.includes('verb')) {
    continue;
  }

  rows.push(
    getGeminiAnalyzeBatchItem({
      source,
      partOfSpeech,
      sourceLanguage: language,
    })
  );
}

writeFileSync(
  `./data/batches/${language}-verbs-jobs.jsonl`,
  rows.map((r) => JSON.stringify(r)).join('\n')
);
