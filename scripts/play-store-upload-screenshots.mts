#!/usr/bin/env -S npx vite-node

// Uploads the screenshots exported by app-stores/ to Google Play.
//
//   ./scripts/play-store-upload-screenshots.mts [--dry-run] [format ...]
//
// Formats are play-phone, play-tablet-10 and play-feature-graphic; all three
// are uploaded when none is given. Expects tmp/<format>.zip for each of them
// (one folder per interface language: en/01.png, …). Unpacks each into tmp/<format>/, and for every language
// deletes the images of that type on the store listing and uploads the new
// ones. All changes go into one edit, which is committed at the end, so a
// failure leaves the store listing untouched.
//
// Needs a Google Cloud service account that has access to the app in Play
// Console with the "Manage store presence" permission. Its JSON key (raw or
// base64) is read from GOOGLE_PLAY_SERVICE_ACCOUNT_KEY in the environment,
// scripts/.env.local or scripts/.env, falling back to the fastlane key at
// mobile-app/android/fastlane/secret/google-play.json.

import { execFileSync } from 'node:child_process';
import { sign } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
} from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const rootDir = dirname(scriptsDir);

// dotenv never overwrites a variable that is already set, so the environment
// wins over .env.local, which wins over .env.
dotenv.config({ path: `${scriptsDir}/.env.local`, quiet: true });
dotenv.config({ path: `${scriptsDir}/.env`, quiet: true });

// app-stores format id → Google Play image types it is uploaded to.
const imageTypes: Record<string, string[]> = {
  'play-phone': ['phoneScreenshots'],
  'play-tablet-10': ['tenInchScreenshots', 'sevenInchScreenshots'],
  'play-feature-graphic': ['featureGraphic'],
};

// Image types that hold a single image rather than a list of screenshots.
const singleImageTypes = ['featureGraphic', 'icon'];

// app-stores language folder → Google Play listing languages it is uploaded to.
const localeMap: Record<string, string[]> = {
  en: ['en-US'],
  ru: ['ru-RU'],
  uk: ['uk'],
  es: ['es-ES'],
  pt: ['pt-BR'],
  tr: ['tr-TR'],
  vi: ['vi'],
  zh: ['zh-CN'],
  'zh-TW': ['zh-TW'],
};

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

const allFormatIds = Object.keys(imageTypes);
const requestedFormatIds = args.filter((arg) => arg !== '--dry-run');

const unknownArgs = requestedFormatIds.filter(
  (arg) => !allFormatIds.includes(arg)
);
if (unknownArgs.length > 0) {
  console.error(
    `Unknown argument(s): ${unknownArgs.join(' ')}\n` +
      `Usage: ./scripts/play-store-upload-screenshots.mts [--dry-run] [${allFormatIds.join(
        '|'
      )} ...]`
  );
  process.exit(1);
}

const formatIds =
  requestedFormatIds.length > 0
    ? allFormatIds.filter((formatId) => requestedFormatIds.includes(formatId))
    : allFormatIds;
const zipPath = (formatId: string) => `${rootDir}/tmp/${formatId}.zip`;
const unpackedDir = (formatId: string) => `${rootDir}/tmp/${formatId}`;

const missingZips = formatIds.map(zipPath).filter((path) => !existsSync(path));
if (missingZips.length > 0) {
  console.error(`Missing ${missingZips.map((path) => `\n  ${path}`).join('')}`);
  process.exit(1);
}

const fastlaneKeyPath = `${rootDir}/mobile-app/android/fastlane/secret/google-play.json`;

const readServiceAccount = (): {
  client_email: string;
  private_key: string;
} => {
  const rawKey = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY;
  if (rawKey) {
    return JSON.parse(
      rawKey.trim().startsWith('{')
        ? rawKey
        : Buffer.from(rawKey, 'base64').toString('utf8')
    );
  }
  if (existsSync(fastlaneKeyPath)) {
    return JSON.parse(readFileSync(fastlaneKeyPath, 'utf8'));
  }
  console.error(
    `GOOGLE_PLAY_SERVICE_ACCOUNT_KEY is not set and ${fastlaneKeyPath} does not exist.`
  );
  process.exit(1);
};

const serviceAccount = readServiceAccount();
const packageName = 'com.vocablypro';

let token: { value: string; expiresAt: number } | undefined;

const getToken = async () => {
  const now = Math.floor(Date.now() / 1000);
  if (token && token.expiresAt - 60 > now) return token.value;

  const encode = (value: object) =>
    Buffer.from(JSON.stringify(value)).toString('base64url');
  const unsigned = `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode({
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/androidpublisher',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 60 * 60,
  })}`;
  const signature = sign(
    'sha256',
    new TextEncoder().encode(unsigned),
    serviceAccount.private_key
  ).toString('base64url');

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${unsigned}.${signature}`,
    }),
  });
  if (!response.ok) {
    throw new Error(
      `Getting a Google access token failed: ${response.status} ${await response.text()}`
    );
  }
  const { access_token, expires_in } = await response.json();

  token = { value: access_token, expiresAt: now + expires_in };
  return token.value;
};

const apiBase = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}`;
const uploadBase = `https://androidpublisher.googleapis.com/upload/androidpublisher/v3/applications/${packageName}`;

const api = async <T = any,>(
  method: string,
  url: string,
  body?: { contentType: string; data: BodyInit }
): Promise<T> => {
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${await getToken()}`,
      ...(body ? { 'Content-Type': body.contentType } : {}),
    },
    body: body?.data,
  });

  if (response.status === 403 && method !== 'GET') {
    throw new Error(
      `${method} ${url} is forbidden. The service account ${serviceAccount.client_email} can't edit the store listing; give it the "Manage store presence" permission in Play Console.`
    );
  }

  if (!response.ok) {
    throw new Error(
      `${method} ${url} failed: ${response.status} ${await response.text()}`
    );
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
};

for (const formatId of formatIds) {
  console.log(`Unpacking ${zipPath(formatId)}...`);
  rmSync(unpackedDir(formatId), { recursive: true, force: true });
  mkdirSync(unpackedDir(formatId), { recursive: true });
  execFileSync(
    'unzip',
    ['-q', zipPath(formatId), '-d', unpackedDir(formatId)],
    {
      stdio: 'inherit',
    }
  );
}

const { id: editId } = await api<{ id: string }>('POST', `${apiBase}/edits`);
const editBase = `${apiBase}/edits/${editId}`;
let committed = false;

try {
  const { listings = [] } = await api<{ listings?: { language: string }[] }>(
    'GET',
    `${editBase}/listings`
  );
  console.log(packageName);

  // Resolve everything up front, so nothing is deleted when the mapping is off.
  const jobs: { imageType: string; locale: string; files: string[] }[] = [];

  for (const [formatId, imageType] of formatIds.flatMap((formatId) =>
    imageTypes[formatId].map((imageType) => [formatId, imageType] as const)
  )) {
    const formatDir = unpackedDir(formatId);

    const languageDirs = readdirSync(formatDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith('__'))
      .map((entry) => entry.name)
      .sort();

    if (languageDirs.length === 0) {
      throw new Error(`${zipPath(formatId)} has no language folders.`);
    }

    for (const language of languageDirs) {
      const locales = localeMap[language];
      if (!locales) {
        console.warn(
          `⚠️  No Google Play language for ${formatId}/${language}, skipping.`
        );
        continue;
      }

      let files = readdirSync(join(formatDir, language))
        .filter((name) => name.toLowerCase().endsWith('.png'))
        .sort()
        .map((name) => join(formatDir, language, name));

      if (files.length === 0) {
        console.warn(`⚠️  No images in ${formatId}/${language}/, skipping.`);
        continue;
      }

      if (singleImageTypes.includes(imageType) && files.length > 1) {
        console.warn(
          `⚠️  ${imageType} holds one image, uploading only ${formatId}/${language}/${basename(
            files[0]
          )}.`
        );
        files = files.slice(0, 1);
      }

      for (const locale of locales) {
        if (!listings.some((l) => l.language === locale)) {
          console.warn(
            `⚠️  The store listing has no ${locale} translation, skipping ${formatId}/${language}/.`
          );
          continue;
        }
        jobs.push({ imageType, locale, files });
      }
    }
  }

  for (const { imageType, locale, files } of jobs) {
    const { images: existing = [] } = await api<{ images?: object[] }>(
      'GET',
      `${editBase}/listings/${locale}/${imageType}`
    );

    console.log(
      `${locale} ${imageType}: replacing ${existing.length} image(s) with ${files.length}`
    );
    if (dryRun) continue;

    await api('DELETE', `${editBase}/listings/${locale}/${imageType}`);

    // Screenshots are shown in the order they are uploaded.
    for (const file of files) {
      console.log(`  ↑ ${basename(dirname(file))}/${basename(file)}`);
      await api(
        'POST',
        `${uploadBase}/edits/${editId}/listings/${locale}/${imageType}?uploadType=media`,
        { contentType: 'image/png', data: new Uint8Array(readFileSync(file)) }
      );
    }
  }

  if (!dryRun) {
    console.log('Committing the edit...');
    await api('POST', `${editBase}:commit`);
    committed = true;
  }
} finally {
  if (!committed) {
    await api('DELETE', editBase).catch((error) =>
      console.warn(`⚠️  Couldn't delete edit ${editId}: ${error.message}`)
    );
  }
}

console.log(dryRun ? 'Dry run, nothing changed.' : 'Done.');
