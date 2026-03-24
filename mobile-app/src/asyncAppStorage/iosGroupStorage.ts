import { AppState, Platform } from 'react-native';
import SharedGroupPreferences from 'react-native-shared-group-preferences';
import { debounceTime, firstValueFrom, ReplaySubject, Subject } from 'rxjs';

const appGroupStorageKey = 'app';
const appGroupId = 'group.vocably.app';

type AllGroupStorageValues = Record<string, string>;

export const getAllValues = async (): Promise<AllGroupStorageValues> => {
  return SharedGroupPreferences.getItem(appGroupStorageKey, appGroupId)
    .then((values) => {
      return values ? JSON.parse(values) : {};
    })
    .catch((errorCode: 0 | 1) => {
      if (errorCode === 1) {
        return {};
      }
    });
};

const allValues$ = new ReplaySubject<AllGroupStorageValues>();
const updateValues$ = new Subject<void>();

if (Platform.OS === 'ios') {
  getAllValues().then((values) => {
    allValues$.next(values);
  });

  AppState.addEventListener('change', (nextAppState) => {
    if (nextAppState === 'active') {
      getAllValues().then((values) => {
        allValues$.next(values);
      });
    }
  });

  updateValues$.pipe(debounceTime(500)).subscribe(async () => {
    const allValues = await firstValueFrom(allValues$);
    await SharedGroupPreferences.setItem(
      appGroupStorageKey,
      JSON.stringify(allValues),
      appGroupId
    );
  });
}

export const getItem = async (key: string): Promise<string | undefined> => {
  const allValues = await firstValueFrom(allValues$);
  return allValues[key] ?? undefined;
};

export const setItem = async (key: string, value: string): Promise<void> => {
  const allValues = await firstValueFrom(allValues$);
  allValues[key] = value;
  allValues$.next(allValues);
  updateValues$.next();
};

export const removeItem = async (key: string): Promise<void> => {
  const allValues = await firstValueFrom(allValues$);
  delete allValues[key];
  allValues$.next(allValues);
  updateValues$.next();
};

export const clear = async (keys: string[]): Promise<void> => {
  const allValues = await firstValueFrom(allValues$);
  keys.forEach((key) => delete allValues[key]);
  allValues$.next(allValues);
  updateValues$.next();
};

export const clearAll = async () => {
  const allKeys = Object.keys(await getAllValues()).filter(
    (key) => key !== 'auth' && !key.includes('posthog')
  );
  await clear(allKeys);
};
