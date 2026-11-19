import { deleteS3Objects, putS3Object, readS3Object } from './s3';

// CloudFront keeps a rendered page for a year, so it has to be invalidated
// when the data it was built from changes. Every page records the
// units-of-speech keys it read (including the missing ones, whose appearance
// changes the page too) as empty marker objects in the SEO bucket:
//
//   dependencies/<url-encoded data key>/<page path>
//
// When a data key changes, listing `dependencies/<url-encoded data key>/`
// yields the pages to invalidate. A per-page manifest of the keys keeps
// re-renders from rewriting markers that already exist.

export const getDependencyPrefix = (dataKey: string) =>
  `dependencies/${encodeURIComponent(dataKey)}/`;

const getManifestKey = (pagePath: string) => `pages/${pagePath}.json`;

const parseManifest = (contents: string | null): string[] => {
  if (contents === null) {
    return [];
  }

  try {
    const parsed = JSON.parse(contents);
    return Array.isArray(parsed)
      ? parsed.filter((key) => typeof key === 'string')
      : [];
  } catch {
    return [];
  }
};

export const updatePageDependencies = async (
  bucket: string,
  pagePath: string,
  dataKeys: Iterable<string>
) => {
  const manifestKey = getManifestKey(pagePath);
  const previous = new Set(
    parseManifest(await readS3Object(bucket, manifestKey))
  );
  const current = new Set(dataKeys);

  const added = [...current].filter((key) => !previous.has(key));
  const removed = [...previous].filter((key) => !current.has(key));

  if (added.length === 0 && removed.length === 0) {
    return;
  }

  await Promise.all(
    added.map((key) =>
      putS3Object(bucket, getDependencyPrefix(key) + pagePath, '', 'text/plain')
    )
  );

  await deleteS3Objects(
    bucket,
    removed.map((key) => getDependencyPrefix(key) + pagePath)
  );

  await putS3Object(
    bucket,
    manifestKey,
    JSON.stringify([...current].sort(), null, 2)
  );
};

/**
 * The keys whose markers may reference pages affected by a change of the
 * given data key: the key itself and its folder, because reverse translations
 * are also looked up by listing `<word>/`.
 */
export const getAffectedDependencyKeys = (changedKey: string): string[] => {
  const keys = [changedKey];
  const lastSlash = changedKey.lastIndexOf('/');

  if (lastSlash !== -1) {
    keys.push(changedKey.slice(0, lastSlash + 1));
  }

  return keys;
};
