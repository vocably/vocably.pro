import { exec } from 'child_process';
import { config } from 'dotenv-flow';
import { inspect, promisify } from 'node:util';
import 'zx/globals';

config();

const execute = promisify(exec);

const userEmail = process.argv[2];
const language = process.argv[3];
const filePath = process.argv[4] || 'deck-as-is.json';

if (!language) {
  throw 'Language must be provided.';
}

const listUsers = `aws cognito-idp list-users --user-pool-id ${process.env.USER_POOL_ID} --filter "email=\\"${userEmail}\\""`;

const listUsersResult = JSON.parse((await execute(listUsers)).stdout);

console.log('User', inspect(listUsersResult, { depth: null }));

const sub = listUsersResult.Users[0].Attributes.find(
  (attr) => attr.Name === 'sub'
).Value;

const s3Path = `s3://${process.env.DECKS_BUCKET}/${sub}/languages/${language}`;

console.log(`Uploading ${filePath} to ${s3Path}`);

await execute(
  `aws s3 cp ${filePath} ${s3Path} --content-type "application/json"`
);
