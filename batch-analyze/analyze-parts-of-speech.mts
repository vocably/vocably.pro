#!/usr/bin/env -S npx vite-node

import {
  getGeminiAnalyzeBatchItem,
  handleGeminiPartsOfSpeechResponse,
} from '@vocably/analyze';
import { config } from 'dotenv-flow';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { listFiles } from './utils.js';

config();

const files = await listFiles('./data/results');

const batchItems = new Map<string, unknown>();

for (const file of files) {
  console.log(`Processing ${file}`);

  const items = readFileSync(file)
    .toString()
    .split('\n')
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line));

  console.log(`Contains ${items.length} items`);

  for (const { key: payloadString, response } of items) {
    const { source, language } = JSON.parse(payloadString);

    const text = response?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      console.error(`Unable to read candidates text for ${payloadString}`);
      continue;
    }

    const partsOfSpeechResult = handleGeminiPartsOfSpeechResponse(text);
    if (partsOfSpeechResult.success === false) {
      console.error(
        `Error handling parts of speech for ${payloadString}: ${partsOfSpeechResult.reason}`
      );
      continue;
    }

    for (const partOfSpeech of partsOfSpeechResult.value) {
      if (partOfSpeech.exists === false) {
        continue;
      }

      const batchItem = getGeminiAnalyzeBatchItem({
        source: partOfSpeech.headword,
        partOfSpeech: partOfSpeech.partOfSpeech,
        sourceLanguage: language,
      });

      // De-duplicate identical analyze payloads (keyed by the batch item key).
      batchItems.set(batchItem.key, batchItem);
    }
  }
}

const rows = [...batchItems.values()];

mkdirSync('./data/batches', { recursive: true });

const fileName = `./data/batches/analyze-parts-of-speech-${Date.now()}.jsonl`;

writeFileSync(fileName, rows.map((r) => JSON.stringify(r)).join('\n'));

console.log(`Wrote ${rows.length} batch items to ${fileName}`);
