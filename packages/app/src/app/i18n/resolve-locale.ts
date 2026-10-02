import { getUserMetadata } from '@vocably/api';
import { detectLocale } from '@vocably/browser-i18n';
import { isSuccess, Locale } from '@vocably/model';

const STORED_LOCALE_KEY = 'interfaceLanguage';
const locales: Locale[] = ['en', 'es', 'pt', 'ru', 'uk', 'tr', 'vi'];

/**
 * Anonymous users have no user metadata, so their choice lives in the browser.
 */
export const storeLocale = (locale: Locale) => {
  try {
    localStorage.setItem(STORED_LOCALE_KEY, locale);
  } catch {}
};

const getStoredLocale = (): Locale | undefined => {
  try {
    const stored = localStorage.getItem(STORED_LOCALE_KEY);
    if (locales.includes(stored as Locale)) {
      return stored as Locale;
    }
  } catch {}
  return undefined;
};

export const resolveLocale = async (): Promise<Locale> => {
  try {
    const result = await getUserMetadata();
    if (isSuccess(result) && result.value.interfaceLanguage) {
      return result.value.interfaceLanguage;
    }
  } catch {}
  return getStoredLocale() ?? detectLocale();
};
