#!/usr/bin/env -S npx vite-node

import { getExpectedNumberOfTranslations } from '@vocably/analyze';
import { config } from 'dotenv-flow';
import { readFileSync, unlinkSync } from 'fs';
import { existsSync } from 'node:fs';
import 'zx/globals';
import { execute, listFiles } from './utils.js';

config();

const languages = ['nl'];

for (const language of languages) {
  const langDir = `../../vocably-languages/${language}`;

  await execute('git pull', { cwd: langDir });

  const translations = await listFiles(langDir + '/translations');

  for (const file of translations) {
    const [headword, partOfSpeech] = file.split('/').slice(-3);

    const translations = readFileSync(file)
      .toString()
      .split('\n')
      .filter(Boolean);

    const unitOfSpeechFilename = `${langDir}/units-of-speech/${headword}/${partOfSpeech}.json`;

    if (!existsSync(unitOfSpeechFilename)) {
      console.log(`Unit of speech file ${unitOfSpeechFilename} does not exist`);
      continue;
    }

    const unitOfSpeech = JSON.parse(
      readFileSync(unitOfSpeechFilename).toString()
    );

    if (
      unitOfSpeech.number === 'plural' &&
      unitOfSpeech.partOfSpeech === 'noun'
    ) {
      unlinkSync(file);
      continue;
    }

    const expectedNumberOfTranslations = getExpectedNumberOfTranslations(
      unitOfSpeech.definitions
    );

    if (translations.length <= expectedNumberOfTranslations) {
      continue;
    }

    unlinkSync(file);
  }

  // await execute('git add .', { cwd: langDir });
  // const status = await execute('git status --porcelain', { cwd: langDir });
  // if (status.split('\n').filter(Boolean).length > 0) {
  //   await execute('git commit -m "Remove verbs and adverbs"', { cwd: langDir });
  //   await execute('git push', { cwd: langDir });
  // }
}
