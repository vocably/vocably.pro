#!/usr/bin/env -S npx vite-node

import { isGoogleLanguage } from '@vocably/model';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, normalize } from 'path';
import 'zx/globals';
import { execute } from './utils.js';

const language = process.argv.at(-1) ?? '';

if (!isGoogleLanguage(language)) {
  throw new Error(`Invalid language ${language}`);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const repoPath = normalize(`${__dirname}/../../vocably-languages/${language}`);

if (!existsSync(repoPath)) {
  throw new Error(`Repo path ${repoPath} does not exist`);
}
const s3BucketPath = `${
  process.env.UNITS_OF_SPEECH_BUCKET
}/${language.toLowerCase()}`;
const s3Path = `s3://${s3BucketPath}`;

await execute(`aws s3 sync units-of-speech ${s3Path}/units-of-speech`, {
  cwd: repoPath,
  maxBuffer: 1024 * 1024 * 20,
});

await execute(`aws s3 sync translations ${s3Path}/translations`, {
  cwd: repoPath,
  maxBuffer: 1024 * 1024 * 20,
});
