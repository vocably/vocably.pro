#!/usr/bin/env -S npx vite-node

import { GoogleLanguage, languageList } from '@vocably/model';
import { config } from 'dotenv-flow';
import { readFileSync, unlinkSync } from 'fs';
import 'zx/globals';
import { checkEnvironment, execute, listFiles } from './utils.js';

config();

checkEnvironment();

const languages: GoogleLanguage[] = [
  // 'nl',
  // 'de',
  // 'pt',
  // 'en',
  'es',
  'it',
  'pt-PT',
  'da',
  'no',
  'sv',
  'en-GB',
];

const syncDir = '../sync-server';

for (const language of languages) {
  console.log(`Processing ${languageList[language]}...`);

  const langDir = `../../vocably-languages/${language}`;

  await execute(`./sync.mts ${language}`, {
    cwd: syncDir,
    maxBuffer: 10 * 1024 * 10240,
  });

  const unitsOfSpeechFiles = await listFiles(langDir + '/units-of-speech');

  for (const file of unitsOfSpeechFiles) {
    const unitOfSpeech = JSON.parse(readFileSync(file).toString());

    if (
      unitOfSpeech.pluralForm === 'null' ||
      unitOfSpeech.pastTenses === 'null'
    ) {
      console.log(`Removing ${file}`);
      unlinkSync(file);
    }
  }

  await execute('git add .', { cwd: langDir });
  const status = await execute('git status --porcelain', { cwd: langDir });
  if (status.split('\n').filter(Boolean).length > 0) {
    await execute('git commit -m "Remove null"', { cwd: langDir });
    await execute('git push', { cwd: langDir });
  }

  await execute(`./sync.mts ${language}`, {
    cwd: syncDir,
    maxBuffer: 10 * 1024 * 10240,
  });
}
