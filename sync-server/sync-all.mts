#!/usr/bin/env -S npx vite-node

import { languageList } from '@vocably/model';
import 'zx/globals';
import { execute } from './utils.js';

for (const language of Object.keys(languageList)) {
  await execute(`./sync.mts ${language}`);
}
