#!/usr/bin/env -S npx vite-node

import { isGoogleLanguage, languageList } from '@vocably/model';
import { readFileSync } from 'fs';
import { existsSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, normalize } from 'path';
import 'zx/globals';
import { execute } from './utils.js';
import { chunk } from 'lodash-es';

const language = process.argv.at(-1) ?? '';

if (!isGoogleLanguage(language)) {
  throw new Error(`Invalid language ${language}`);
}

console.log(`Syncing ${languageList[language]}...`);
console.log(`AWS_PROFILE: ${process.env.AWS_PROFILE}`);
console.log(`UNITS_OF_SPEECH bucket: ${process.env.UNITS_OF_SPEECH_BUCKET}`);

if (process.env.UNITS_OF_SPEECH_BUCKET !== 'vocably-prod-units-of-speech') {
  console.log('This is a non-prod environment. Skipping sync.');
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
const s3BucketPath = `vocably-prod-units-of-speech/${language.toLowerCase()}`;
const s3Path = `s3://${s3BucketPath}/`;

let stats = await getStats();

// if (stats.isSyncing) {
//   console.log('Already syncing');
//   process.exit(0);
// }

stats.isSyncing = true;
await saveStats(stats);

await gitPull();
const newHash = await getHash();

const deleteFiles = await getDeletedFiles(stats.lastSyncedHash, newHash);
const modifiedFiles = await getModifiedFiles(stats.lastSyncedHash, newHash);

if (deleteFiles.length > 0) {
  console.log(`Deleting ${deleteFiles.length} files`);
}

for (const batch of chunk(deleteFiles, 10)) {
  await Promise.allSettled(
    batch.map((file) => execute(`aws s3 rm ${quotePath(s3Path + file)}`))
  );
}

if (modifiedFiles.length > 0) {
  console.log(`Uploading ${modifiedFiles.length} files`);
}

for (const batch of chunk(modifiedFiles, 10)) {
  await Promise.allSettled(
    batch.map((file) =>
      execute(`aws s3 cp ${quotePath(file)} ${quotePath(s3Path + file)}`, {
        cwd: repoPath,
      })
    )
  );
}

console.log('Downloading data from S3');

await execute(
  `rclone copy prod:${s3BucketPath} . --size-only --fast-list --progress --ignore-existing`,
  {
    cwd: repoPath,
  }
);

const status = await gitStatus();
if (status.length > 0) {
  console.log('New objects received from S3. Committing changes.');
  await gitAdd();
  await gitCommit('Automated S3 synchronization of data files');
  await gitPush();
}

stats.lastSynced = new Date();
stats.lastSyncedHash = await getHash();
stats.isSyncing = false;
await saveStats(stats);

type LanguageStats = {
  isSyncing: boolean;
  lastSynced: Date;
  lastSyncedHash: string;
};

async function getStats(): Promise<LanguageStats> {
  if (existsSync(statsFilePath)) {
    const statsObject = JSON.parse(readFileSync(statsFilePath).toString());
    return {
      isSyncing: statsObject.isSyncing,
      lastSynced: new Date(statsObject.lastSynced),
      lastSyncedHash: statsObject.lastSyncedHash,
    };
  }

  return {
    isSyncing: false,
    lastSynced: new Date(),
    lastSyncedHash: await getHash(),
  };
}

async function saveStats(stats: LanguageStats) {
  writeFileSync(statsFilePath, JSON.stringify(stats, null, 2));
}

async function getHash(): Promise<string> {
  return (
    await execute(`git rev-parse HEAD`, {
      cwd: repoPath,
    })
  ).trim();
}

async function gitPull() {
  await execute(`git pull`, {
    cwd: repoPath,
  });
}

async function getDeletedFiles(
  oldHash: string,
  newHash: string
): Promise<string[]> {
  return (
    await execute(
      `git diff --name-only --diff-filter=D "${oldHash}" "${newHash}"`,
      {
        cwd: repoPath,
      }
    )
  )
    .trim()
    .split('\n')
    .filter(Boolean)
    .filter(
      (file) =>
        file.startsWith('units-of-speech/') || file.startsWith('translations/')
    );
}

async function getModifiedFiles(
  oldHash: string,
  newHash: string
): Promise<string[]> {
  return (
    await execute(
      `git diff --name-only --diff-filter=ACMR "${oldHash}" "${newHash}"`,
      {
        cwd: repoPath,
      }
    )
  )
    .trim()
    .split('\n')
    .filter(Boolean);
}

function quotePath(path: string): string {
  return process.platform === 'win32'
    ? `"${path}"`
    : `'${path.replace(/'/g, "'\\''")}'`;
}

async function gitStatus(): Promise<string[]> {
  return (
    await execute(`git status --porcelain`, {
      cwd: repoPath,
    })
  )
    .trim()
    .split('\n')
    .filter(Boolean);
}

async function gitAdd() {
  await execute(`git add .`, {
    cwd: repoPath,
  });
}

async function gitCommit(message: string) {
  await execute(`git commit -m "${message}"`, {
    cwd: repoPath,
  });
}

async function gitPush() {
  await execute(`git push`, {
    cwd: repoPath,
  });
}
