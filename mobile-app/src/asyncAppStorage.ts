import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as iosGroupStorage from './asyncAppStorage/iosGroupStorage';

export const getItem = async (key: string): Promise<string | undefined> => {
  if (Platform.OS === 'ios') {
    return iosGroupStorage.getItem(key);
  }

  return AsyncStorage.getItem(key).then((value) => value ?? undefined);
};

export const setItem = async (key: string, value: string): Promise<void> => {
  if (Platform.OS === 'ios') {
    return iosGroupStorage.setItem(key, value);
  }

  return AsyncStorage.setItem(key, value);
};

export const removeItem = async (key: string): Promise<void> => {
  if (Platform.OS === 'ios') {
    return iosGroupStorage.removeItem(key);
  }

  return AsyncStorage.removeItem(key);
};

export const clear = async (keys: string[]): Promise<void> => {
  if (Platform.OS === 'ios') {
    return iosGroupStorage.clear(keys);
  }

  return AsyncStorage.multiRemove(keys);
};

export const clearAll = async (): Promise<void> => {
  if (Platform.OS === 'ios') {
    await iosGroupStorage.clearAll();
  }

  const allKeys = (await AsyncStorage.getAllKeys()).filter(
    (key) => key !== 'auth' && !key.includes('posthog')
  );
  await AsyncStorage.multiRemove(allKeys);
};

export const getAll = async (): Promise<Record<string, string>> => {
  if (Platform.OS === 'ios') {
    return iosGroupStorage.getAllValues();
  }

  const allKeys = await AsyncStorage.getAllKeys();
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
