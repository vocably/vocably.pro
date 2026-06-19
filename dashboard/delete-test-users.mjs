import { config } from 'dotenv-flow';

config();

// Deletes all PostHog persons (and all their events/activity) whose
// initial app version ($initial_app_version person property) matches the
// version passed as an argument. Useful for cleaning up test users created
// by a specific app build.
//
// Usage:
//   node delete-test-users.mjs <initialAppVersion>            # dry run (lists matches)
//   node delete-test-users.mjs <initialAppVersion> --confirm  # actually deletes
//
// Example:
//   node delete-test-users.mjs 114 --confirm

const POSTHOG_KEY = process.env.POSTHOG_KEY;
const POSTHOG_HOST = process.env.POSTHOG_HOST || 'https://eu.posthog.com';

const initialAppVersion = process.argv[2];
const confirmed = process.argv.includes('--confirm');

if (!POSTHOG_KEY || POSTHOG_KEY === 'to-be-provided') {
  console.error(
    'POSTHOG_KEY is not set in the environment (.env / .env.local).'
  );
  process.exit(1);
}

if (!initialAppVersion || initialAppVersion.startsWith('--')) {
  console.error(
    'Usage: node delete-test-users.mjs <initialAppVersion> [--confirm]'
  );
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${POSTHOG_KEY}`,
  'Content-Type': 'application/json',
};

const phFetch = async (path, init = {}) => {
  const response = await fetch(`${POSTHOG_HOST}${path}`, {
    ...init,
    headers: { ...headers, ...(init.headers || {}) },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `PostHog request failed: ${init.method || 'GET'} ${path} -> ${response.status} ${body}`
    );
  }

  // DELETE responses are typically empty (204).
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

const resolveProjectId = async () => {
  if (process.env.POSTHOG_PROJECT_ID) {
    return process.env.POSTHOG_PROJECT_ID;
  }

  const projects = await phFetch('/api/projects/');
  const project = projects.results?.[0];

  if (!project) {
    throw new Error('No PostHog projects available for this API key.');
  }

  console.log(`Using project "${project.name}" (id ${project.id}).`);
  return project.id;
};

const fetchPersonsByInitialAppVersion = async (projectId, version) => {
  const properties = encodeURIComponent(
    JSON.stringify([
      {
        key: '$initial_app_version',
        value: [version],
        operator: 'exact',
        type: 'person',
      },
    ])
  );

  const persons = [];
  let path = `/api/projects/${projectId}/persons/?properties=${properties}&limit=100`;

  while (path) {
    const page = await phFetch(path);
    persons.push(...(page.results || []));

    if (page.next) {
      // `next` is an absolute URL; strip the host so phFetch can prepend it.
      path = page.next.replace(POSTHOG_HOST, '');
    } else {
      path = null;
    }
  }

  return persons;
};

const deletePerson = (projectId, person) =>
  phFetch(
    `/api/projects/${projectId}/persons/${person.uuid}/?delete_events=true`,
    {
      method: 'DELETE',
    }
  );

const emailOf = (person) =>
  person.properties?.email || person.distinct_ids?.[0] || person.uuid;

const projectId = await resolveProjectId();

console.log(
  `Fetching persons with $initial_app_version = "${initialAppVersion}"...`
);

const persons = await fetchPersonsByInitialAppVersion(
  projectId,
  initialAppVersion
);

console.log(`Found ${persons.length} matching person(s).`);

if (persons.length === 0) {
  process.exit(0);
}

for (const person of persons) {
  console.log(`  - ${emailOf(person)} (${person.uuid})`);
}

if (!confirmed) {
  console.log(
    '\nDry run. Re-run with --confirm to delete these persons and all their events.'
  );
  process.exit(0);
}

console.log('\nDeleting persons and all their events...');

let deleted = 0;
for (const person of persons) {
  try {
    await deletePerson(projectId, person);
    deleted++;
    console.log(`  deleted ${emailOf(person)} (${person.uuid})`);
  } catch (error) {
    console.error(
      `  FAILED ${emailOf(person)} (${person.uuid}):`,
      error.message
    );
  }
}

console.log(`\nDone. Deleted ${deleted}/${persons.length} person(s).`);
