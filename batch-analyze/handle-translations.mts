#!/usr/bin/env -S npx vite-node

import {
  getAnalyseCacheFileName,
  getUnitOfSpeechTranslationFileName,
  handleGeminiAnalyzeResponse,
  handleGeminiTranslationResponse,
} from '@vocably/analyze';
import { parseJson } from '@vocably/api';
import { config } from 'dotenv-flow';
import { readFileSync, unlinkSync, writeFileSync } from 'fs';
import { mkdirSync, renameSync } from 'node:fs';
import { listFiles } from './utils.js';
import { dirname } from 'path';

config();

const files = await listFiles('./data/results');

function deletePoorlyProcessedFile(payload: any) {
  const fileName = getAnalyseCacheFileName(payload);
  try {
    unlinkSync(`./../../vocably-languages/${fileName}`);
  } catch (e) {}
}

for (let file of files) {
  console.log(`Processing ${file}`);
  const items = readFileSync(file)
    .toString()
    .split('\n')
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line));

  console.log(`Contains ${items.length} items`);

  for (let { key: payloadString, response } of items) {
    const payload = JSON.parse(payloadString);

    if (
      !response ||
      !response.candidates ||
      !response.candidates[0]?.content?.parts[0]?.text
    ) {
      console.error(`Unable to read candidates text`);
      deletePoorlyProcessedFile(payload);
      continue;
    }

    const content = response.candidates[0].content.parts[0].text;
    const parseResult = parseJson(content);

    if (!parseResult.success) {
      console.error(
        `Error parsing ${payloadString}: ${parseResult.reason}. Deleting file.`
      );
      deletePoorlyProcessedFile(payload);
      continue;
    }
    const translationResult = handleGeminiTranslationResponse(content);
    if (!translationResult.success) {
      console.error(
        `Error handling translation response ${payloadString}. Deleting file`,
        translationResult
      );
      deletePoorlyProcessedFile(payload);
      continue;
    }

    const fileName = getUnitOfSpeechTranslationFileName(payload);

    const filePath = `./../../vocably-languages/${fileName}`;

    // Create the folder structure if it doesn't exist
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, JSON.stringify(translationResult.value));
  }

  const theNameOfFile = file.split('/').pop();
  renameSync(file, `./data/processed/${theNameOfFile}`);
}
