#!/usr/bin/env -S npx vite-node

import { languageList } from '@vocably/model';
import { exec } from 'child_process';
import { config } from 'dotenv-flow';
import { promisify } from 'node:util';
import 'zx/globals';

config();
const execute = promisify(exec);

for (const l of Object.keys(languageList)) {
  const repoName = `vocably/${l}`;
  await execute(
    `gh repo edit ${repoName} --homepage https://vocably.pro?l=${l}`
  );
}
