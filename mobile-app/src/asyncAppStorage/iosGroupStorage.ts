import { AppState, Platform } from 'react-native';
import SharedGroupPreferences from 'react-native-shared-group-preferences';
import { debounceTime, firstValueFrom, ReplaySubject, Subject } from 'rxjs';

const appGroupStorageKey = 'app';
const appGroupId = 'group.vocably.app';

type AllGroupStorageValues = Record<string, string>;

const DELETED_SENTINEL = Symbol('deleted');
type DirtyEntry = string | typeof DELETED_SENTINEL;

export const getAllValues = async (): Promise<AllGroupStorageValues> => {
  return SharedGroupPreferences.getItem(appGroupStorageKey, appGroupId)
    .then((values) => {
      return values ? JSON.parse(values) : {};
    })
    .catch(() => {
      return {};
    });
};

const allValues$ = new ReplaySubject<AllGroupStorageValues>();
const updateValues$ = new Subject<void>();

const dirtyKeys = new Map<string, DirtyEntry>();

const flushToDisk = async (): Promise<void> => {
  const allValues = await firstValueFrom(allValues$);
  await SharedGroupPreferences.setItem(
    appGroupStorageKey,
    JSON.stringify(allValues),
    appGroupId
  );
  // Only clear keys that haven't been modified again since flush started
  for (const [key, value] of [...dirtyKeys.entries()]) {
    const currentInMemory = allValues[key];
    if (value === DELETED_SENTINEL && !(key in allValues)) {
      dirtyKeys.delete(key);
    } else if (value !== DELETED_SENTINEL && currentInMemory === value) {
      dirtyKeys.delete(key);
    }
  }
};

if (Platform.OS === 'ios') {
  getAllValues().then((values) => {
    allValues$.next(values);
  });

  AppState.addEventListener('change', async (nextAppState) => {
    if (nextAppState === 'active') {
      // Flush pending writes before reading from disk
      if (dirtyKeys.size > 0) {
        await flushToDisk();
      }

      const diskValues = await getAllValues();

      // Merge: overlay any remaining dirty in-memory keys on top of disk values
      if (dirtyKeys.size > 0) {
        const merged = { ...diskValues };
        for (const [key, value] of dirtyKeys.entries()) {
          if (value === DELETED_SENTINEL) {
            delete merged[key];
          } else {
            merged[key] = value;
          }
        }
        allValues$.next(merged);
      } else {
        allValues$.next(diskValues);
      }
    }
  });

  updateValues$.pipe(debounceTime(500)).subscribe(() => {
    void flushToDisk();
  });
}

export const getItem = async (key: string): Promise<string | undefined> => {
  const allValues = await firstValueFrom(allValues$);
  return allValues[key] ?? undefined;
};

export const setItem = async (key: string, value: string): Promise<void> => {
  const allValues = await firstValueFrom(allValues$);
  dirtyKeys.set(key, value);
  allValues$.next({ ...allValues, [key]: value });
  updateValues$.next();
};

export const removeItem = async (key: string): Promise<void> => {
  const allValues = await firstValueFrom(allValues$);
  dirtyKeys.set(key, DELETED_SENTINEL);
  const { [key]: _, ...rest } = allValues;
  allValues$.next(rest);
  updateValues$.next();
};

export const clear = async (keys: string[]): Promise<void> => {
  const allValues = await firstValueFrom(allValues$);
  const updated = { ...allValues };
  keys.forEach((key) => {
    dirtyKeys.set(key, DELETED_SENTINEL);
    delete updated[key];
  });
  allValues$.next(updated);
  updateValues$.next();
};

export const clearAll = async () => {
  const allValues = await firstValueFrom(allValues$);
  const allKeys = Object.keys(allValues).filter(
    (key) => key !== 'auth' && !key.includes('posthog')
  );
  await clear(allKeys);
};
