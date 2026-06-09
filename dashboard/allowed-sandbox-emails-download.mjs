import { exec } from 'child_process';
import { config } from 'dotenv-flow';
import { promisify } from 'node:util';
import 'zx/globals';

config();

const execute = promisify(exec);

const bucket = process.env.USER_STATIC_FILES_BUCKET;
const key = 'allowed-sandbox-emails.json';

await execute(`aws s3 cp s3://${bucket}/${key} ./${key}`);

console.log(`Downloaded ${key} from ${bucket}`);
