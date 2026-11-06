// Deletes from the www bucket the files that the previous build had and the
// current one doesn't.
//
// Usage: node www-delete-removed.mjs <dist> <previous dist> <bucket>
//
// The previous dist is the build restored from the CircleCI cache. When it is
// missing (first deploy, expired cache, local terraform run) the bucket listing
// is used instead, which is slower but just as correct.
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const [dist, previous, bucket] = process.argv.slice(2);

if (!dist || !bucket) {
  console.error(
    'Usage: node www-delete-removed.mjs <dist> <previous dist> <bucket>'
  );
  process.exit(1);
}

const listFiles = (root) =>
  readdirSync(root, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) =>
      relative(root, join(entry.parentPath, entry.name)).split(sep).join('/')
    );

const aws = (args) =>
  execFileSync('aws', args, {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 1024,
  });

const listBucket = () => {
  // The CLI follows the pagination itself and merges the pages.
  const output = aws([
    's3api',
    'list-objects-v2',
    '--bucket',
    bucket,
    '--query',
    'Contents[].Key',
    '--output',
    'json',
  ]);
  return JSON.parse(output) ?? [];
};

let previousFiles;
if (previous && existsSync(previous)) {
  console.log(`Comparing the www build with the previous one at ${previous}`);
  previousFiles = listFiles(previous);
} else {
  console.log(`No previous www build, comparing with s3://${bucket} instead`);
  previousFiles = listBucket();
}

const currentFiles = new Set(listFiles(dist));
const removedFiles = previousFiles.filter((file) => !currentFiles.has(file));

console.log(
  `Deleting ${removedFiles.length} removed file(s) from s3://${bucket}`
);

// delete-objects accepts at most 1000 keys per request.
for (let i = 0; i < removedFiles.length; i += 1000) {
  const batch = removedFiles.slice(i, i + 1000);
  batch.forEach((key) => console.log(`delete: s3://${bucket}/${key}`));

  const output = aws([
    's3api',
    'delete-objects',
    '--bucket',
    bucket,
    '--delete',
    JSON.stringify({
      Objects: batch.map((Key) => ({ Key })),
      Quiet: true,
    }),
    '--output',
    'json',
  ]);

  const errors = output.trim() ? (JSON.parse(output).Errors ?? []) : [];
  if (errors.length > 0) {
    console.error(JSON.stringify(errors, null, 2));
    process.exit(1);
  }
}
