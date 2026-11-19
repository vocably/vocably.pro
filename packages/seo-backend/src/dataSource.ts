/**
 * Read access to the units-of-speech data, keyed the same way as the
 * units-of-speech S3 bucket (e.g. `de/units-of-speech/apfel/noun.json`).
 */
export type DataSource = {
  /** Resolves to null when the key doesn't exist. */
  read(key: string): Promise<string | null>;
  /** Lists the keys under the prefix, recursively. */
  list(prefix: string): Promise<string[]>;
};

export type RecordingDataSource = DataSource & {
  /** Every key and prefix that was looked up, whether it existed or not. */
  readonly accessedKeys: Set<string>;
};

/**
 * Remembers what a page was built from. A page has to be re-rendered when any
 * of those keys changes, including the ones that were missing at render time.
 */
export const recordAccess = (source: DataSource): RecordingDataSource => {
  const accessedKeys = new Set<string>();

  return {
    accessedKeys,
    read: (key) => {
      accessedKeys.add(key);
      return source.read(key);
    },
    list: (prefix) => {
      accessedKeys.add(prefix);
      return source.list(prefix);
    },
  };
};
