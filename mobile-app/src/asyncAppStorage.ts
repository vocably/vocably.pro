import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as iosGroupStorage from './asyncAppStorage/iosGroupStorage';
import { mmkvStorage } from './mmkvStorage';

const getAllAsyncValues = async () => {
  const allKeys = await AsyncStorage.getAllKeys();

  if (allKeys.length === 0) {
    return undefined;
  }

  let allValues: Record<string, string> = {};

  for (const key of allKeys) {
    const item = await AsyncStorage.getItem(key);
    if (item === null) {
      continue;
    }
    allValues[key] = item;
  }

  return allValues;
};

// ToDo: do I even need this?
const clearAllAsyncValues = async () => {
  const whiteListedKeys = [
    '.posthog-rn.json',
    'auth',
    'vocablyAuthStatus',
    'userStaticMetadata',
    'userMetadata',
    'studyStreak',
    'languageDecks',
    'languagesContainerSelectedLanguage',
    'last-recalibration',
    'translationPresetSelectedLanguage',
    'languagePairs',
    'languageTransformations',
  ];

  const allKeys = (await AsyncStorage.getAllKeys()).filter((k) =>
    whiteListedKeys.some((wk) => k.endsWith(wk))
  );
};

const populateMMKV = (values: Record<string, string>) => {
  for (let [key, value] of Object.entries(values)) {
    mmkvStorage.set(key, value);
  }
};

const migrateToMMKV = new Promise<void>(async (resolve) => {
  if (mmkvStorage.getBoolean('mmkvMigrated')) {
    resolve();
    return;
  }

  if (Platform.OS === 'ios') {
    const values = await iosGroupStorage.getAllValues();
    if (values) {
      populateMMKV(values);
    }
  } else {
    const values = await getAllAsyncValues();
    if (values) {
      populateMMKV(values);
    }
  }

  mmkvStorage.set('mmkvMigrated', true);
  resolve();
});

export const getItem = async (key: string): Promise<string | undefined> => {
  await migrateToMMKV;
  return mmkvStorage.getString(key);
};

export const setItem = async (key: string, value: string): Promise<void> => {
  await migrateToMMKV;
  mmkvStorage.set(key, value);
};

export const removeItem = async (key: string): Promise<void> => {
  await migrateToMMKV;
  mmkvStorage.remove(key);
};

export const clear = async (keys: string[]): Promise<void> => {
  await migrateToMMKV;
  for (const key of keys) {
    mmkvStorage.remove(key);
  }
};

export const clearAll = async (): Promise<void> => {
  await migrateToMMKV;

  const allKeys = mmkvStorage
    .getAllKeys()
    .filter((key) => key !== 'auth' && !key.includes('posthog'));

  await clear(allKeys);
};

export const getAll = async (): Promise<Record<string, string>> => {
  await migrateToMMKV;

  const allKeys = mmkvStorage.getAllKeys();
  let allValues: Record<string, string> = {};
  for (const key of allKeys) {
    const value = mmkvStorage.getString(key);
    if (value !== undefined) {
      allValues[key] = value;
    }
  }
  return allValues;
};
