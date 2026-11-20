#!/usr/bin/env -S npx vite-node

// Uploads the SEO search data of a language pair to the SEO bucket (see
// platform/seo.tf), one object per word.
//
//   ./scripts/seo-upload-search-data.mts <source>-<target>
//
// e.g. ./scripts/seo-upload-search-data.mts de-en reads
// packages/www/seo/search-data/de-en.json and uploads the value of each of its
// keys as de-en/<key>.json.
//
// Reads SEO_BUCKET and AWS_REGION from the environment, scripts/.env.local
// (dev bucket) or scripts/.env (prod bucket).

import { existsSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

const scriptsDir = dirname(fileURLToPath(import.meta.url));

// dotenv never overwrites a variable that is already set, so the environment
// wins over .env.local, which wins over .env.
dotenv.config({ path: `${scriptsDir}/.env.local`, quiet: true });
dotenv.config({ path: `${scriptsDir}/.env`, quiet: true });

const concurrency = 50;

const pair = process.argv[2];
if (!pair || !/^[a-z]{2,3}(-[A-Za-z]+)?-[a-z]{2,3}(-[A-Za-z]+)?$/.test(pair)) {
  console.error(
    'Usage: ./scripts/seo-upload-search-data.mts <source>-<target>'
  );
  process.exit(1);
}

const bucket = process.env.SEO_BUCKET;
if (!bucket) {
  console.error('SEO_BUCKET is not set.');
  process.exit(1);
}

const dataFile = `${scriptsDir}/../packages/www/seo/search-data/${pair}.json`;
if (!existsSync(dataFile)) {
  console.error(`No search data for ${pair}: ${dataFile} doesn't exist.`);
  process.exit(1);
}

const data: Record<string, unknown> = JSON.parse(
  readFileSync(dataFile, 'utf8')
);
const keys = Object.keys(data);

console.log(
  `Uploading ${keys.length} items of ${pair} to s3://${bucket}/${pair}/`
);

const s3 = new S3Client({ region: process.env.AWS_REGION });

let uploaded = 0;
const failed: string[] = [];
let next = 0;

const worker = async () => {
  while (next < keys.length) {
    const key = keys[next++];
    try {
      await s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: `${pair}/${key}.json`,
          Body: JSON.stringify(data[key]),
          ContentType: 'application/json',
        })
      );
      uploaded++;
      if (uploaded % 1000 === 0) {
        console.log(`${uploaded}/${keys.length}`);
      }
    } catch (error) {
      failed.push(key);
      console.error(`Failed to upload "${key}":`, error);
    }
  }
};

await Promise.all(Array.from({ length: concurrency }, worker));

console.log(`Uploaded ${uploaded}/${keys.length} items.`);
if (failed.length > 0) {
  console.error(`${failed.length} items failed: ${failed.join(', ')}`);
  process.exit(1);
}
