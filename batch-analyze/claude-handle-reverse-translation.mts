#!/usr/bin/env -S npx vite-node

// Saves downloaded reverse translation batch results to
// ../../vocably-reverse-translations/data/{targetLanguage}/{sourceLanguage}/{source}.json

import type Anthropic from '@anthropic-ai/sdk';
import { handleClaudeTranslateResponse } from '@vocably/analyze';
import { config } from 'dotenv-flow';
import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import {
  claudePayloadsDir,
  claudeReverseTranslateBatchPrefix,
  type ClaudeReverseTranslatePayloads,
  getFileName,
  getReverseTranslationFileName,
} from './claude-utils.js';
import { listFiles } from './utils.js';

config();

const files = (await listFiles('./data/results')).filter((file) =>
  getFileName(file).startsWith(claudeReverseTranslateBatchPrefix)
);

if (files.length === 0) {
  console.log('No Claude reverse translation results to process.');
}

mkdirSync('./data/processed', { recursive: true });

for (const file of files) {
  console.log(`Processing ${file}`);

  const batchName = getFileName(file).split('--')[0];
  const payloads: ClaudeReverseTranslatePayloads = JSON.parse(
    readFileSync(`${claudePayloadsDir}/${batchName}.json`).toString()
  );

  const items: Anthropic.Messages.MessageBatchIndividualResponse[] =
    readFileSync(file)
      .toString()
      .split('\n')
      .filter((line) => line.length > 0)
      .map((line) => JSON.parse(line));

  console.log(`Contains ${items.length} items`);

  const failed: string[] = [];
  let saved = 0;

  for (const { custom_id, result } of items) {
    const payload = payloads[custom_id];

    if (!payload) {
      console.error(`Unknown custom_id ${custom_id}. Skipping.`);
      continue;
    }

    if (result.type !== 'succeeded') {
      console.error(`${payload.source}: request ${result.type}`);
      failed.push(payload.source);
      continue;
    }

    const translationResult = handleClaudeTranslateResponse(
      result.message,
      payload
    );

    if (!translationResult.success) {
      console.error(`${payload.source}: ${translationResult.reason}`);
      failed.push(payload.source);
      continue;
    }

    if (translationResult.value.length === 0) {
      console.error(`${payload.source}: no translations`);
      failed.push(payload.source);
      continue;
    }

    const filePath = getReverseTranslationFileName(payload);

    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, JSON.stringify(translationResult.value, null, 2));
    saved++;
  }

  console.log(`Saved ${saved} reverse translations. Failed ${failed.length}.`);

  if (failed.length > 0) {
    const failedFile = `./data/failed-${batchName}.json`;
    writeFileSync(failedFile, JSON.stringify(failed, null, 2));
    console.log(`Failed items are saved to ${failedFile}`);
  }

  renameSync(file, `./data/processed/${getFileName(file)}`);
}
