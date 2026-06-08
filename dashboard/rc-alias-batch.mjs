import { readFileSync } from 'fs';
import { execute } from '@vocably/node-sulna';

const emails = readFileSync('./user-state/emails.txt', 'utf-8')
  .trim()
  .split('\n');

for (const email of emails) {
  await execute(`node ./rc-alias.mjs ${email}`);
}
