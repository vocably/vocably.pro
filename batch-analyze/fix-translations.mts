#!/usr/bin/env -S npx vite-node

import { getExpectedNumberOfTranslations } from '@vocably/analyze';
import { config } from 'dotenv-flow';
import { readFileSync, unlinkSync, writeFileSync } from 'fs';
import { existsSync } from 'node:fs';
import 'zx/globals';
import { execute, listFiles } from './utils.js';
import { GoogleLanguage, languageList } from '@vocably/model';
import { parseJson } from '@vocably/api';
import { isArray, isString } from 'lodash-es';

config();

const languages = Object.keys(languageList) as GoogleLanguage[];

for (const language of languages) {
  const langDir = `../../vocably-languages/${language}`;

  const translations = await listFiles(langDir + '/translations');

  let fixed = 0;
  let deleted = 0;

  for (const translationFile of translations) {
    const translations = readFileSync(translationFile, 'utf-8');

    const parseResult = parseJson(translations);

    if (parseResult.success === false) {
      continue;
    }

    if (
      !isArray(parseResult.value) ||
      !parseResult.value.length ||
      !parseResult.value.every(isString)
    ) {
      console.log(`Deleting ${translationFile}`, parseResult.value);
      deleted++;
      unlinkSync(translationFile);
      continue;
    }

    writeFileSync(translationFile, parseResult.value.join('\n') + '\n');
    fixed++;
  }

  console.log(
    `${language} - ${languageList[language]} - fixed ${fixed} deleted ${deleted}`
  );
}
