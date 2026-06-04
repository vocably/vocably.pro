import { exec } from 'child_process';
import { config } from 'dotenv-flow';
import { inspect, promisify } from 'node:util';
import 'zx/globals';

config();

const API_KEY_V1 = process.env.RC_KEY_V1;
const API_KEY_V2 = process.env.RC_KEY_V2;
const PROJECT_ID = process.env.RC_PROJECT_ID;
const USER_POOL_ID = process.env.USER_POOL_ID;

const RC_BASE = 'https://api.revenuecat.com/v2';
const RC_BASE_V1 = 'https://api.revenuecat.com/v1';

const execute = promisify(exec);

const appUserId = process.argv[2];

if (!appUserId) {
  console.error('Usage: node rc-alias.mjs <app_user_id>');
  process.exit(1);
}

for (const [name, value] of [
  ['RC_KEY_V1', API_KEY_V1],
  ['RC_KEY_V2', API_KEY_V2],
  ['RC_PROJECT_ID', PROJECT_ID],
  ['USER_POOL_ID', USER_POOL_ID],
]) {
  if (!value) {
    console.error(`Missing required env variable: ${name}`);
    process.exit(1);
  }
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isCognitoSub = (id) => UUID_RE.test(id);
const isEmail = (id) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(id);

const rcFetch = (path, init = {}) =>
  fetch(`${RC_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${API_KEY_V2}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });

// The V2 API cannot create aliases, so aliasing falls back to the legacy V1 API.
const rcFetchV1 = (path, init = {}) =>
  fetch(`${RC_BASE_V1}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${API_KEY_V1}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });

// 1 + 2. Fetch the customer's aliases via RevenueCat REST API V2.
const listAliases = async (customerId) => {
  const aliases = [];
  let path = `/projects/${PROJECT_ID}/customers/${encodeURIComponent(
    customerId
  )}/aliases?limit=50`;

  while (path) {
    const response = await rcFetch(path);

    if (!response.ok) {
      const body = await response.text();
      console.error(
        `Failed to list aliases (${response.status} ${response.statusText}):`,
        body
      );
      process.exit(1);
    }

    const data = await response.json();
    for (const item of data.items ?? []) {
      aliases.push(item.id);
    }

    // `next_page` is a relative path (already prefixed with /v2 in the API).
    path = data.next_page ? data.next_page.replace(/^\/v2/, '') : null;
  }

  return aliases;
};

const aliases = await listAliases(appUserId);

console.log('Customer aliases:', inspect(aliases, { depth: null }));

// 3. If a Cognito sub is already an alias, stop.
const existingSub = aliases.find(isCognitoSub);
if (existingSub) {
  console.log(
    `Customer already has a Cognito sub alias: ${existingSub}. Nothing to do.`
  );
  process.exit(0);
}

// 4. Otherwise, find an email alias and resolve it to a Cognito sub.
const email = aliases.find(isEmail);
if (!email) {
  console.error(
    'No Cognito sub and no email alias found. Cannot resolve a sub.'
  );
  process.exit(1);
}

console.log(`Resolving Cognito sub for email: ${email}`);

const listUsers = `aws cognito-idp list-users --user-pool-id ${USER_POOL_ID} --filter "email=\\"${email}\\""`;
const listUsersResult = JSON.parse((await execute(listUsers)).stdout);

if (!listUsersResult.Users || listUsersResult.Users.length === 0) {
  console.error(`No Cognito user found for email: ${email}`);
  process.exit(1);
}

if (listUsersResult.Users.length > 1) {
  console.warn(
    `Multiple (${listUsersResult.Users.length}) Cognito users found for ${email}. Using the first one.`
  );
}

const sub = listUsersResult.Users[0].Attributes.find(
  (attr) => attr.Name === 'sub'
)?.Value;

if (!sub) {
  console.error(`Cognito user for ${email} has no sub attribute.`);
  process.exit(1);
}

console.log(`Resolved Cognito sub: ${sub}`);

// 5. Set the sub as an alias for the customer via the legacy RevenueCat V1 API
// (the V2 API has no endpoint to create aliases).
const createResponse = await rcFetchV1(
  `/subscribers/${encodeURIComponent(appUserId)}/alias`,
  {
    method: 'POST',
    body: JSON.stringify({ new_app_user_id: sub }),
  }
);

const createBody = await createResponse.text();

console.log(
  `Create alias response: ${createResponse.status} ${createResponse.statusText}`
);
console.log(createBody);

if (!createResponse.ok) {
  console.error('Failed to set the Cognito sub as an alias.');
  process.exit(1);
}

console.log(`Successfully set ${sub} as an alias for ${appUserId}.`);
