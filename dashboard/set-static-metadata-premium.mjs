import { exec } from 'child_process';
import { config } from 'dotenv-flow';
import { writeFileSync } from 'fs';
import { set } from 'lodash-es';
import { inspect, promisify } from 'node:util';
import 'zx/globals';

config();

const execute = promisify(exec);

const userEmail = process.argv[2];

const listUsers = `aws cognito-idp list-users --user-pool-id ${process.env.USER_POOL_ID} --filter "email=\\"${userEmail}\\""`;

const listUsersResult = JSON.parse((await execute(listUsers)).stdout);

console.log('User', inspect(listUsersResult, { depth: null }));

const sub = listUsersResult.Users[0].Attributes.find(
  (attr) => attr.Name === 'sub'
).Value;

const s3FileLocation = `s3://${process.env.USER_STATIC_FILES_BUCKET}/${sub}/static-metadata.json`;

let metadataJson;

try {
  metadataJson =
    (await execute(`aws s3 cp ${s3FileLocation} -`)).stdout || '{}';
} catch (e) {
  if (e.stderr.includes('(404)')) {
    metadataJson = '{}';
  } else {
    throw e;
  }
}

writeFileSync('./metadata-static.json', metadataJson, 'utf8');
const userStaticMetadata = JSON.parse(metadataJson);

set(userStaticMetadata, 'premium', true);

console.log(
  'User static metadata',
  inspect(userStaticMetadata, { depth: null })
);

const tempFileName = './metadata-static-temp.json';

writeFileSync(tempFileName, JSON.stringify(userStaticMetadata));

await execute(
  `aws s3 cp ${tempFileName} ${s3FileLocation} --content-type "application/json"`
);
