#!/usr/bin/env -S npx vite-node

import { GoogleGenAI } from '@google/genai';
import { config } from 'dotenv-flow';
import { renameSync } from 'node:fs';
import { addJob, listFiles } from './utils.js';

config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const batchFilesToSend = await listFiles('./data/batches');

for (let fileName of batchFilesToSend) {
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
    model: 'gemini-3-flash-preview',
    src: uploadedFile.name,
  });

  addJob(batchJob);

  const nameOfFile = fileName.split('/').pop();

  renameSync(fileName, `./data/sent-batches/${nameOfFile}`);
}
