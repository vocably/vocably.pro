#!/usr/bin/env -S npx vite-node

import { isGoogleLanguage, languageList } from '@vocably/model';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, normalize } from 'path';
import 'zx/globals';
import { execute } from './utils.js';

const folders = {
  t: 'translations',
  u: 'units-of-speech',
} as const;

const language = process.argv.at(-2) ?? '';
const folderKey = process.argv.at(-1) ?? '';

if (!isGoogleLanguage(language)) {
  throw new Error(`Invalid language ${language}`);
}

if (!(folderKey in folders)) {
  throw new Error(`Invalid folder ${folderKey}. Expected t or u.`);
}

const folder = folders[folderKey as keyof typeof folders];

console.log(`Copying ${folder} for ${languageList[language]}...`);
console.log(`AWS_PROFILE: ${process.env.AWS_PROFILE}`);
console.log(`UNITS_OF_SPEECH bucket: ${process.env.UNITS_OF_SPEECH_BUCKET}`);

if (process.env.UNITS_OF_SPEECH_BUCKET !== 'vocably-prod-units-of-speech') {
  console.log('This is a non-prod environment. Skipping copy.');
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const repoPath = normalize(
  `${__dirname}/../../vocably-languages/${language.toLowerCase()}`
);

if (!existsSync(repoPath)) {
  throw new Error(`Repo path ${repoPath} does not exist`);
}

const statsFilePath = `${__dirname}/stats/${language}.json`;
const s3Path = `s3://vocably-prod-units-of-speech/${language.toLowerCase()}/${folder}`;

await execute(`aws s3 cp ${folder} ${s3Path} --recursive`, {
  cwd: repoPath,
});

const hash = (
  await execute(`git rev-parse HEAD`, {
    cwd: repoPath,
  })
).trim();

const stats = existsSync(statsFilePath)
  ? JSON.parse(readFileSync(statsFilePath).toString())
  : { isSyncing: false };

stats.lastSynced = new Date();
stats.lastSyncedHash = hash;

writeFileSync(statsFilePath, JSON.stringify(stats, null, 2));

console.log(`Stats updated. lastSyncedHash: ${hash}`);
