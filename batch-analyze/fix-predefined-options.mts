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

const predefinedOptionsDir =
  '../../vocably-predefined-options/predefined-options';
const predefinedOptionsFiles = await listFiles(predefinedOptionsDir);

for (const file of predefinedOptionsFiles) {
  const predefinedOptions = JSON.parse(readFileSync(file, 'utf-8'));
  for (const item of predefinedOptions) {
    if (!item.translation) {
      console.log('Skipping', item, file);
      continue;
    }

    const parseResult = parseJson(item.translation);

    if (parseResult.success === false) {
      console.log('Skipping (translation is fine)', item, file);
      continue;
    }

    item.translation = parseResult.value.join(', ');
  }
  writeFileSync(file, JSON.stringify(predefinedOptions));
}
