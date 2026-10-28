#!/usr/bin/env -S npx vite-node

// Uploads the screenshots exported by app-stores/ to App Store Connect.
//
//   ./scripts/upload-app-store-screenshots.mts ios-iphone-6.5 [--dry-run]
//
// Takes tmp/<format>.zip (one folder per interface language: en/01.png, …),
// unpacks it into tmp/<format>/, and for every language replaces the
// screenshots of that display type on the editable App Store version.
//
// ios-header and ios-search-results are not screenshot sets: their en/01.png
// is uploaded to the app's Asset Library and placed as the product page
// header or the search results image of the version localization, replacing
// the previous one. Apple reviews it with the version.
//
// Needs an App Store Connect API key with the App Manager or Admin role:
// APP_STORE_CONNECT_API_KEY_KEY_ID, APP_STORE_CONNECT_API_KEY_ISSUER_ID and
// APP_STORE_CONNECT_API_KEY_KEY (the .p8 contents, base64 or PEM), read from
// the environment, scripts/.env.local or scripts/.env.

import { execFileSync } from 'node:child_process';
import { createHash, sign } from 'node:crypto';
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

// app-stores format id → App Store Connect screenshot display type.
const displayTypes: Record<string, string> = {
  'ios-iphone-6.5': 'APP_IPHONE_65',
  'ios-ipad-13': 'APP_IPAD_PRO_3GEN_129',
};

// app-stores format id → Asset Library placement type.
const placementTypes: Record<string, string> = {
  'ios-header': 'PRODUCT_PAGE_HEADER_ASSET',
  'ios-search-results': 'APP_STORE_SEARCH_RESULTS_ASSET',
};

// app-stores language folder → App Store localizations it is uploaded to.
const localeMap: Record<string, string[]> = {
  en: ['en-US'],
  ru: ['ru'],
  uk: ['uk'],
  es: ['es-ES'],
  pt: ['pt-BR'],
  tr: ['tr'],
  vi: ['vi'],
  zh: ['zh-Hans'],
  'zh-TW': ['zh-Hant'],
};

// Versions whose screenshots can still be edited.
const editableStates = [
  'PREPARE_FOR_SUBMISSION',
  'DEVELOPER_REJECTED',
  'REJECTED',
  'METADATA_REJECTED',
  'INVALID_BINARY',
];

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const formatId = basename(
  args.find((arg) => !arg.startsWith('--')) ?? '',
  '.zip'
);

if (!displayTypes[formatId] && !placementTypes[formatId]) {
  console.error(
    `Usage: ./scripts/upload-app-store-screenshots.mts <${[
      ...Object.keys(displayTypes),
      ...Object.keys(placementTypes),
    ].join('|')}> [--dry-run]`
  );
  process.exit(1);
}

const displayType = displayTypes[formatId];
const placementType = placementTypes[formatId];
const zipPath = `${rootDir}/tmp/${formatId}.zip`;
const unpackedDir = `${rootDir}/tmp/${formatId}`;

if (!existsSync(zipPath)) {
  console.error(`${zipPath} does not exist.`);
  process.exit(1);
}

const requireEnv = (name: string) => {
  const value = process.env[name];
  if (!value) {
    console.error(`${name} is not set.`);
    process.exit(1);
  }
  return value;
};

const keyId = requireEnv('APP_STORE_CONNECT_API_KEY_KEY_ID');
const issuerId = requireEnv('APP_STORE_CONNECT_API_KEY_ISSUER_ID');
const rawKey = requireEnv('APP_STORE_CONNECT_API_KEY_KEY');
const privateKey = rawKey.includes('BEGIN PRIVATE KEY')
  ? rawKey.replace(/\\n/g, '\n')
  : Buffer.from(rawKey, 'base64').toString('utf8');
const bundleId = 'pro.vocably.app';

let token: { value: string; expiresAt: number } | undefined;

const getToken = () => {
  const now = Math.floor(Date.now() / 1000);
  if (token && token.expiresAt - 60 > now) return token.value;

  const encode = (value: object) =>
    Buffer.from(JSON.stringify(value)).toString('base64url');
  const expiresAt = now + 15 * 60;
  const unsigned = `${encode({ alg: 'ES256', kid: keyId, typ: 'JWT' })}.${encode(
    { iss: issuerId, iat: now, exp: expiresAt, aud: 'appstoreconnect-v1' }
  )}`;
  const signature = sign('sha256', new TextEncoder().encode(unsigned), {
    key: privateKey,
    dsaEncoding: 'ieee-p1363',
  }).toString('base64url');

  token = { value: `${unsigned}.${signature}`, expiresAt };
  return token.value;
};

type Resource = {
  id: string;
  type: string;
  attributes: Record<string, any>;
};

const api = async <T = any,>(
  method: string,
  path: string,
  body?: object
): Promise<T> => {
  const response = await fetch(`https://api.appstoreconnect.apple.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${getToken()}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 403 && method !== 'GET') {
    throw new Error(
      `${method} ${path} is forbidden. The API key ${keyId} can't edit App Store metadata; use a key with the App Manager or Admin role.`
    );
  }

  if (!response.ok) {
    throw new Error(
      `${method} ${path} failed: ${response.status} ${await response.text()}`
    );
  }

  return response.status === 204 ? (undefined as T) : response.json();
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Sends the file's parts to the upload operations App Store Connect reserved.
const uploadParts = async (
  operations: any[],
  file: Uint8Array,
  filePath: string
) => {
  for (const operation of operations) {
    const response = await fetch(operation.url, {
      method: operation.method,
      headers: Object.fromEntries(
        operation.requestHeaders.map((h: { name: string; value: string }) => [
          h.name,
          h.value,
        ])
      ),
      body: file.subarray(
        operation.offset,
        operation.offset + operation.length
      ),
    });
    if (!response.ok) {
      throw new Error(
        `Uploading ${filePath} failed: ${response.status} ${await response.text()}`
      );
    }
  }
};

const uploadScreenshot = async (setId: string, filePath: string) => {
  const file = new Uint8Array(readFileSync(filePath));

  const { data: screenshot } = await api<{ data: Resource }>(
    'POST',
    '/v1/appScreenshots',
    {
      data: {
        type: 'appScreenshots',
        attributes: { fileName: basename(filePath), fileSize: file.length },
        relationships: {
          appScreenshotSet: { data: { type: 'appScreenshotSets', id: setId } },
        },
      },
    }
  );

  await uploadParts(screenshot.attributes.uploadOperations, file, filePath);

  await api('PATCH', `/v1/appScreenshots/${screenshot.id}`, {
    data: {
      type: 'appScreenshots',
      id: screenshot.id,
      attributes: {
        uploaded: true,
        sourceFileChecksum: createHash('md5').update(file).digest('hex'),
      },
    },
  });

  return screenshot.id;
};

// Apple can take many minutes to process a batch of screenshots, so all of
// them are uploaded first and waited for together.
const processingTimeout = 30 * 60 * 1000;

const waitForProcessing = async (
  screenshots: { id: string; filePath: string }[]
) => {
  const deadline = Date.now() + processingTimeout;
  let pending = screenshots;

  while (pending.length > 0) {
    const stillPending: typeof pending = [];
    for (const screenshot of pending) {
      const { data } = await api<{ data: Resource }>(
        'GET',
        `/v1/appScreenshots/${screenshot.id}?fields[appScreenshots]=assetDeliveryState`
      );
      const { state, errors } = data.attributes.assetDeliveryState ?? {};
      if (state === 'FAILED') {
        throw new Error(
          `App Store Connect rejected ${screenshot.filePath}: ${JSON.stringify(errors)}`
        );
      }
      if (state !== 'COMPLETE') stillPending.push(screenshot);
    }

    if (stillPending.length === 0) return;
    if (Date.now() > deadline) {
      throw new Error(
        `Timed out waiting for App Store Connect to process:\n${stillPending
          .map((s) => `  ${s.filePath}`)
          .join('\n')}`
      );
    }
    if (stillPending.length !== pending.length) {
      console.log(
        `  ${screenshots.length - stillPending.length}/${screenshots.length} processed`
      );
    }
    pending = stillPending;
    await sleep(5000);
  }
};

// Uploads the file to the Asset Library and waits until it can be placed.
const uploadLibraryImage = async (
  assetLibraryId: string,
  filePath: string,
  fileName: string
) => {
  const file = new Uint8Array(readFileSync(filePath));

  const { data: image } = await api<{ data: Resource }>(
    'POST',
    '/v1/appAssetLibraryImages',
    {
      data: {
        type: 'appAssetLibraryImages',
        attributes: {
          fileName,
          fileSize: file.length,
          category: 'CREATIVE_ASSETS',
        },
        relationships: {
          assetLibrary: {
            data: { type: 'appAssetLibraries', id: assetLibraryId },
          },
        },
      },
    }
  );

  await uploadParts(image.attributes.uploadOperations, file, filePath);

  await api('PATCH', `/v1/appAssetLibraryImages/${image.id}`, {
    data: {
      type: 'appAssetLibraryImages',
      id: image.id,
      attributes: { uploaded: true },
    },
  });

  for (let attempt = 0; attempt < 60; attempt++) {
    const { data } = await api<{ data: Resource }>(
      'GET',
      `/v1/appAssetLibraryImages/${image.id}?fields[appAssetLibraryImages]=state,stateDetails`
    );
    const { state, stateDetails } = data.attributes;
    if (state === 'FAILED') {
      throw new Error(
        `App Store Connect rejected ${filePath}: ${JSON.stringify(stateDetails)}`
      );
    }
    if (state !== 'AWAITING_UPLOAD' && state !== 'UPLOAD_COMPLETE') {
      return image.id;
    }
    await sleep(2000);
  }
  throw new Error(`Timed out waiting for ${filePath} to be processed.`);
};

console.log(`Unpacking ${zipPath}...`);
rmSync(unpackedDir, { recursive: true, force: true });
mkdirSync(unpackedDir, { recursive: true });
execFileSync('unzip', ['-q', zipPath, '-d', unpackedDir], { stdio: 'inherit' });

const languageDirs = readdirSync(unpackedDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && !entry.name.startsWith('__'))
  .map((entry) => entry.name)
  .sort();

const { data: apps } = await api<{ data: Resource[] }>(
  'GET',
  `/v1/apps?filter[bundleId]=${encodeURIComponent(bundleId)}`
);
const app = apps.find((a) => a.attributes.bundleId === bundleId);
if (!app) throw new Error(`App ${bundleId} not found.`);

const { data: versions } = await api<{ data: Resource[] }>(
  'GET',
  `/v1/apps/${app.id}/appStoreVersions?filter[platform]=IOS&filter[appStoreState]=${editableStates.join(
    ','
  )}`
);
const version = versions[0];
if (!version) {
  throw new Error(
    'There is no editable iOS App Store version. Create one in App Store Connect first.'
  );
}
console.log(
  `${app.attributes.name} ${version.attributes.versionString} (${version.attributes.appStoreState}), ${displayType ?? placementType}`
);

const { data: localizations } = await api<{ data: Resource[] }>(
  'GET',
  `/v1/appStoreVersions/${version.id}/appStoreVersionLocalizations?limit=200`
);

// Resolve everything up front, so nothing is deleted when the mapping is off.
const jobs: {
  language: string;
  locale: string;
  localizationId: string;
  files: string[];
}[] = [];

for (const language of languageDirs) {
  const locales = localeMap[language];
  if (!locales) {
    console.warn(`⚠️  No App Store locale for "${language}", skipping.`);
    continue;
  }

  const files = readdirSync(join(unpackedDir, language))
    .filter((name) => name.toLowerCase().endsWith('.png'))
    .sort()
    .map((name) => join(unpackedDir, language, name));

  if (files.length === 0) {
    console.warn(`⚠️  No screenshots in ${language}/, skipping.`);
    continue;
  }

  for (const locale of locales) {
    const localization = localizations.find(
      (l) => l.attributes.locale === locale
    );
    if (!localization) {
      console.warn(
        `⚠️  ${version.attributes.versionString} has no ${locale} localization, skipping ${language}/.`
      );
      continue;
    }
    jobs.push({ language, locale, localizationId: localization.id, files });
  }
}

const assetLibraryId = placementType
  ? (await api<{ data: Resource }>('GET', `/v1/apps/${app.id}/assetLibrary`))
      .data.id
  : undefined;

// Asset Library image per language, shared by the locales it is placed on.
const libraryImages = new Map<string, string>();

// Screenshot sets to order once their screenshots are processed.
const uploadedSets: { setId: string; ids: string[]; files: string[] }[] = [];

for (const { language, locale, localizationId, files } of jobs) {
  if (placementType) {
    const { data: existing } = await api<{ data: Resource[] }>(
      'GET',
      `/v1/appStoreVersionLocalizations/${localizationId}/placements?filter[placementType]=${placementType}`
    );

    if (files.length > 1) {
      console.warn(
        `⚠️  ${language}/ has ${files.length} images, only ${basename(files[0])} is used.`
      );
    }
    console.log(
      `${locale}: replacing ${existing.length} placement(s) with ${language}/${basename(files[0])}`
    );
    if (dryRun) continue;

    if (!libraryImages.has(language)) {
      console.log(`  ↑ ${language}/${basename(files[0])}`);
      libraryImages.set(
        language,
        await uploadLibraryImage(
          assetLibraryId!,
          files[0],
          `${formatId}-${language}.png`
        )
      );
    }

    for (const placement of existing) {
      await api('DELETE', `/v1/appAssetLibraryPlacements/${placement.id}`);
    }

    await api('POST', '/v1/appAssetLibraryPlacements', {
      data: {
        type: 'appAssetLibraryPlacements',
        attributes: { placementType },
        relationships: {
          image: {
            data: {
              type: 'appAssetLibraryImages',
              id: libraryImages.get(language),
            },
          },
          appStoreVersionLocalization: {
            data: { type: 'appStoreVersionLocalizations', id: localizationId },
          },
        },
      },
    });
    continue;
  }

  const { data: sets } = await api<{ data: Resource[] }>(
    'GET',
    `/v1/appStoreVersionLocalizations/${localizationId}/appScreenshotSets?filter[screenshotDisplayType]=${displayType}`
  );
  let set = sets.find(
    (s) => s.attributes.screenshotDisplayType === displayType
  );

  const { data: existing } = set
    ? await api<{ data: Resource[] }>(
        'GET',
        `/v1/appScreenshotSets/${set.id}/appScreenshots?limit=50`
      )
    : { data: [] as Resource[] };

  console.log(
    `${locale}: replacing ${existing.length} screenshot(s) with ${files.length}`
  );
  if (dryRun) continue;

  for (const screenshot of existing) {
    await api('DELETE', `/v1/appScreenshots/${screenshot.id}`);
  }

  if (!set) {
    ({ data: set } = await api<{ data: Resource }>(
      'POST',
      '/v1/appScreenshotSets',
      {
        data: {
          type: 'appScreenshotSets',
          attributes: { screenshotDisplayType: displayType },
          relationships: {
            appStoreVersionLocalization: {
              data: {
                type: 'appStoreVersionLocalizations',
                id: localizationId,
              },
            },
          },
        },
      }
    ));
  }

  const ids: string[] = [];
  for (const file of files) {
    console.log(`  ↑ ${basename(dirname(file))}/${basename(file)}`);
    ids.push(await uploadScreenshot(set!.id, file));
  }

  uploadedSets.push({ setId: set!.id, ids, files });
}

if (uploadedSets.length > 0) {
  console.log('Waiting for App Store Connect to process the screenshots...');
  await waitForProcessing(
    uploadedSets.flatMap(({ ids, files }) =>
      ids.map((id, i) => ({ id, filePath: files[i] }))
    )
  );

  for (const { setId, ids } of uploadedSets) {
    await api(
      'PATCH',
      `/v1/appScreenshotSets/${setId}/relationships/appScreenshots`,
      {
        data: ids.map((id) => ({ type: 'appScreenshots', id })),
      }
    );
  }
}

console.log(dryRun ? 'Dry run, nothing changed.' : 'Done.');
