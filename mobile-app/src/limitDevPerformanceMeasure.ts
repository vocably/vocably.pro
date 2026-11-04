// Dev-only workaround for slow re-renders with large decks.
//
// In development builds React 19 logs every re-rendered component to the
// "Components" performance track, attaching a diff of its changed props via
// `performance.measure(name, { detail })`. React Native's `performance.measure`
// deep-copies `detail` with a JavaScript `structuredClone`. When a component
// receives the cards array of a 1000+ card deck, the diff holds tens of
// thousands of entries, and copying them blocked the JS thread for seconds
// after each card was added.
//
// This caps the size of the attached diff. The performance tracks keep
// working; only very long prop diffs are truncated. Production builds are not
// affected: React's production renderer doesn't produce these diffs.

const MAX_ENTRIES = 50;
const MAX_VALUE_LENGTH = 200;

type Property = [string, string];

const limitProperties = (properties: Property[]): Property[] => {
  const limited: Property[] = properties
    .slice(0, MAX_ENTRIES)
    .map(([key, value]) => [
      key,
      typeof value === 'string' && value.length > MAX_VALUE_LENGTH
        ? `${value.slice(0, MAX_VALUE_LENGTH)}…`
        : value,
    ]);

  if (properties.length > MAX_ENTRIES) {
    limited.push([
      '…',
      `${properties.length - MAX_ENTRIES} more entries omitted`,
    ]);
  }

  return limited;
};

export const limitDevPerformanceMeasure = () => {
  if (
    !__DEV__ ||
    typeof performance === 'undefined' ||
    typeof performance.measure !== 'function'
  ) {
    return;
  }

  const originalMeasure = performance.measure;

  performance.measure = function (
    this: Performance,
    name: string,
    startOrOptions?: any,
    endMark?: string
  ) {
    const properties = startOrOptions?.detail?.devtools?.properties;

    if (Array.isArray(properties)) {
      // React reuses the options object between calls, so build a new one
      // instead of mutating it.
      startOrOptions = {
        ...startOrOptions,
        detail: {
          ...startOrOptions.detail,
          devtools: {
            ...startOrOptions.detail.devtools,
            properties: limitProperties(properties),
          },
        },
      };
    }

    return originalMeasure.call(this, name, startOrOptions, endMark);
  } as typeof performance.measure;
};
