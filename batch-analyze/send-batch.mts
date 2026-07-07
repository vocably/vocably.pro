#!/usr/bin/env -S npx vite-node

import { GoogleGenAI } from '@google/genai';
import { config } from 'dotenv-flow';
import { readFileSync, renameSync } from 'node:fs';
import { addJob, listFiles } from './utils.js';

config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const batchFilesToSend = await listFiles('./data/batches');

for (let fileName of batchFilesToSend) {
  const firstLine = readFileSync(fileName, 'utf-8').split('\n')[0];

  if (!firstLine) {
    console.error(`File ${fileName} is empty. Skipping.`);
    continue;
  }

  const model: string | undefined = JSON.parse(
    firstLine
  )?.request?.model?.replace('models/', '');

  if (!model) {
    console.error(`Can't detect the model in ${fileName}. Skipping.`);
    continue;
  }

  console.log(`Detected model "${model}" in ${fileName}`);

  const uploadedFile = await ai.files.upload({
    file: fileName,
    config: {
      mimeType: 'jsonl',
    },
  });

  console.log(uploadedFile);

  if (!uploadedFile.name) {
    console.error('File upload failed', uploadedFile);
    continue;
  }

  const batchJob = await ai.batches.create({
    model,
    src: uploadedFile.name,
  });

  addJob(batchJob);

  const nameOfFile = fileName.split('/').pop();

  renameSync(fileName, `./data/sent-batches/${nameOfFile}`);
}
