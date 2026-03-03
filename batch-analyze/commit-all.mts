#!/usr/bin/env -S npx vite-node

import { config } from 'dotenv-flow';
import { languageList } from '@vocably/model';
import { execute } from './utils.ts';

config();

for (let language of Object.keys(languageList)) {
  const langDir = `../../vocably-languages/${language.toLowerCase()}`;
  await execute(`git add .`, { cwd: langDir });
  await execute(`git commit -m "Update"`, { cwd: langDir });
  await execute(`git push`, { cwd: langDir });
}
