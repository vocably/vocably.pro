import { exec } from 'child_process';
import { config } from 'dotenv-flow';
import { promisify } from 'node:util';
import 'zx/globals';

config();

const execute = promisify(exec);

const bucket = process.env.USER_STATIC_FILES_BUCKET;
const key = 'allowed-sandbox-emails.json';

await execute(`aws s3 cp ./${key} s3://${bucket}/${key}`);

console.log(`Uploaded ${key} from ${bucket}`);
