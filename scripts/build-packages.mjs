import 'zx/globals';
import { rootDir } from './helpers/dirs.mjs';

cd(rootDir);

const packages = [
  'jest',
  'sulna',
  'node-sulna',
  'model',
  'crud',
  'srs',
  'model-operations',
  'browser-i18n',
  'webpack',
  'api',
  'lambda-shared',
  'analyze',
  'browser',
  'extension-stay-alive',
  'extension-messages',
  'extension-service-worker',
  'extension-content-ui',
  'extension-content-script',
];

for (let packageName of packages) {
  console.log(`Building ${packageName}...`);
  await $`npm --prefix ./packages/${packageName} run build`;
}
