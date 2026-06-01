import { getItem, setItem } from '../asyncAppStorage';
import { mmkvStorage } from '../mmkvStorage';
import { isSupportedLocale, SupportedLocale } from './supportedLocales';

export const APP_LOCALE_OVERRIDE_KEY = 'appLocaleOverride';

/**
 * Synchronous read used by i18n init (before any React renders).
 * Bypasses asyncAppStorage's AsyncStorage→MMKV migration gate: this key is
 * brand-new and never lived in AsyncStorage, so reading MMKV directly is safe.
 */
export const getAppLocaleOverrideSync = (): SupportedLocale | undefined => {
  const stored = mmkvStorage.getString(APP_LOCALE_OVERRIDE_KEY);
  return isSupportedLocale(stored) ? stored : undefined;
};

export const getAppLocaleOverride = async (): Promise<
  SupportedLocale | undefined
> => {
  const stored = await getItem(APP_LOCALE_OVERRIDE_KEY);
  return isSupportedLocale(stored) ? stored : undefined;
};

export const setAppLocaleOverride = (code: SupportedLocale): Promise<void> =>
  setItem(APP_LOCALE_OVERRIDE_KEY, code);
