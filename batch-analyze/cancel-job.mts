#!/usr/bin/env -S npx vite-node

import { GoogleGenAI } from '@google/genai';
import { config } from 'dotenv-flow';

config();

const name = process.argv[2] as string;

console.log('Job ID:', name);

if (!name) {
  console.error('Usage: cancel-job.mts <job-id>');
  process.exit(1);
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const result = await ai.batches.cancel({
  name,
});

console.log(result);
