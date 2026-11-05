#!/usr/bin/env -S npx vite-node

// Updates the localized "What's New" of the iOS app.
//
//   ./scripts/app-store-update-whats-new.mts [--dry-run]
//
// For every interface language in `whatsNew` it sets "What's New" on the
// editable App Store version. Only the localizations that differ from App
// Store Connect are sent.
//
// Needs an App Store Connect API key with the App Manager or Admin role:
// APP_STORE_CONNECT_API_KEY_KEY_ID, APP_STORE_CONNECT_API_KEY_ISSUER_ID and
// APP_STORE_CONNECT_API_KEY_KEY (the .p8 contents, base64 or PEM), read from
// the environment, scripts/.env.local or scripts/.env.

import { sign } from 'node:crypto';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const scriptsDir = dirname(fileURLToPath(import.meta.url));

// dotenv never overwrites a variable that is already set, so the environment
// wins over .env.local, which wins over .env.
dotenv.config({ path: `${scriptsDir}/.env.local`, quiet: true });
dotenv.config({ path: `${scriptsDir}/.env`, quiet: true });

// Max 4000 characters, outro included. Ignored by Apple for the very first
// version.
const whatsNew: Record<string, string> = {
  en: [
    '- Get explanations of complex sentences.',
    '- The study plan is now easier to understand.',
  ].join('\n'),
  ru: [
    '- Объяснение сложных предложений.',
    '- План обучения стал понятнее.',
  ].join('\n'),
  uk: [
    '- Пояснення складних речень.',
    '- План навчання став зрозумілішим.',
  ].join('\n'),
  es: [
    '- Explicaciones de oraciones complejas.',
    '- El plan de estudio ahora es más fácil de entender.',
  ].join('\n'),
  pt: [
    '- Explicações de frases complexas.',
    '- O plano de estudo ficou mais fácil de entender.',
  ].join('\n'),
  tr: [
    '- Karmaşık cümlelerin açıklamaları.',
    '- Çalışma planı artık daha kolay anlaşılıyor.',
  ].join('\n'),
  vi: [
    '- Giải thích các câu phức tạp.',
    '- Kế hoạch học giờ đây dễ hiểu hơn.',
  ].join('\n'),
  zh: ['- 解释复杂的句子。', '- 学习计划变得更容易理解了。'].join('\n'),
  'zh-TW': ['- 解釋複雜的句子。', '- 學習計畫變得更容易理解了。'].join('\n'),
};

// Appended to every "What's New".
const whatsNewOutro: Record<string, string> = {
  en: 'Vocably is improving, folks!',
  ru: 'Vocably становится лучше, друзья!',
  uk: 'Vocably стає кращим, друзі!',
  es: '¡Vocably sigue mejorando, amigos!',
  pt: 'O Vocably está melhorando, pessoal!',
  tr: 'Vocably gelişiyor, arkadaşlar!',
  vi: 'Vocably đang ngày càng tốt hơn, các bạn ơi!',
  zh: 'Vocably 越来越好啦，朋友们！',
  'zh-TW': 'Vocably 越來越好囉，朋友們！',
};

for (const language of Object.keys(whatsNew)) {
  whatsNew[language] = [whatsNew[language], whatsNewOutro[language]]
    .filter(Boolean)
    .join('\n\n');
}

// Interface language → App Store localizations it is written to.
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

const limit = 4000;

// App Store version states whose metadata can still be edited.
const editableVersionStates = [
  'PREPARE_FOR_SUBMISSION',
  'DEVELOPER_REJECTED',
  'REJECTED',
  'METADATA_REJECTED',
  'INVALID_BINARY',
];

const dryRun = process.argv.includes('--dry-run');

const problems = Object.entries(whatsNew).flatMap(([language, text]) => [
  ...(localeMap[language] ? [] : [`${language}: no App Store locale`]),
  ...(whatsNewOutro[language] ? [] : [`${language}: no What's New outro`]),
  ...(text.length > limit
    ? [`${language} is ${text.length} characters, max ${limit}`]
    : []),
]);

if (problems.length > 0) {
  console.error(problems.join('\n'));
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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const api = async <T = any,>(
  method: string,
  path: string,
  body?: object,
  attempt = 1
): Promise<T> => {
  const response = await fetch(`https://api.appstoreconnect.apple.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${getToken()}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  // App Store Connect answers with an occasional 500 that goes away on retry.
  if (response.status >= 500 && attempt < 5) {
    await sleep(attempt * 2000);
    return api(method, path, body, attempt + 1);
  }

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

const preview = (value: string) => {
  const line = value.replace(/\n/g, ' ⏎ ');
  return line.length > 80 ? `${line.slice(0, 77)}...` : line;
};

const { data: apps } = await api<{ data: Resource[] }>(
  'GET',
  `/v1/apps?filter[bundleId]=${encodeURIComponent(bundleId)}`
);
const app = apps.find((a) => a.attributes.bundleId === bundleId);
if (!app) throw new Error(`App ${bundleId} not found.`);

const { data: versions } = await api<{ data: Resource[] }>(
  'GET',
  `/v1/apps/${app.id}/appStoreVersions?filter[platform]=IOS&filter[appStoreState]=${editableVersionStates.join(
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
  `${app.attributes.name} ${version.attributes.versionString} (${version.attributes.appStoreState})`
);

const { data: versionLocalizations } = await api<{ data: Resource[] }>(
  'GET',
  `/v1/appStoreVersions/${version.id}/appStoreVersionLocalizations?limit=200`
);

for (const [language, text] of Object.entries(whatsNew)) {
  for (const locale of localeMap[language]) {
    const existing = versionLocalizations.find(
      (l) => l.attributes.locale === locale
    );

    if ((existing?.attributes.whatsNew ?? '') === text) {
      console.log(`${locale}: up to date`);
      continue;
    }

    console.log(`${locale}: ${existing ? 'updating' : 'creating'}`);
    console.log(`  whatsNew: ${preview(text)}`);
    if (dryRun) continue;

    if (existing) {
      await api('PATCH', `/v1/appStoreVersionLocalizations/${existing.id}`, {
        data: {
          type: 'appStoreVersionLocalizations',
          id: existing.id,
          attributes: { whatsNew: text },
        },
      });
    } else {
      await api('POST', '/v1/appStoreVersionLocalizations', {
        data: {
          type: 'appStoreVersionLocalizations',
          attributes: { locale, whatsNew: text },
          relationships: {
            appStoreVersion: {
              data: { type: 'appStoreVersions', id: version.id },
            },
          },
        },
      });
    }
  }
}

console.log(dryRun ? 'Dry run, nothing changed.' : 'Done.');
