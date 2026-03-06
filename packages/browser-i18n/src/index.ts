import { GoogleLanguage } from '@vocably/model';
import { ru } from './ru';
import { en } from './en';
import { uk } from './uk';
import { vi } from './vi';
import { tr } from './tr';

export type Locale = 'en' | 'ru' | 'uk' | 'vi' | 'tr';

export type Translations = Record<Locale, Record<string, string>>;

export type LanguageTranslationOption =
  | `nominative_${GoogleLanguage}`
  | `objective_${GoogleLanguage}`;

const SUPPORTED_LOCALES: Locale[] = ['en', 'ru', 'uk', 'vi', 'tr'];

export const detectLocale = (): Locale => {
  console.log('detectLocale');
  const languages =
    typeof navigator !== 'undefined'
      ? navigator.languages?.length
        ? navigator.languages
        : [navigator.language]
      : ['en'];
  for (const lang of languages) {
    const code = lang.split('-')[0].toLowerCase();
    if (SUPPORTED_LOCALES.includes(code as Locale)) {
      return code as Locale;
    }
  }
  return 'en';
};

const LOCALE_KEY = '__vocably_locale__';
const WATCHERS_KEY = '__vocably_locale_watchers__';

const getWatchers = (): Map<Element, () => void> => {
  if (typeof window === 'undefined') return new Map();
  if (!(window as any)[WATCHERS_KEY]) {
    (window as any)[WATCHERS_KEY] = new Map<Element, () => void>();
  }
  return (window as any)[WATCHERS_KEY];
};

export const setLocale = (locale: Locale) => {
  if (locale === getLocale()) return;
  if (typeof window !== 'undefined') {
    (window as any)[LOCALE_KEY] = locale;
  }
  getWatchers().forEach((forceUpdateFn) => {
    try {
      forceUpdateFn();
    } catch {}
  });
};

export const getLocale = (): Locale => {
  if (typeof window !== 'undefined' && (window as any)[LOCALE_KEY]) {
    return (window as any)[LOCALE_KEY] as Locale;
  }
  return 'en';
};

export const subscribeToLocale = (
  el: Element,
  forceUpdateFn: () => void
): (() => void) => {
  getWatchers().set(el, forceUpdateFn);
  return () => getWatchers().delete(el);
};

export const buildT =
  (translations: Translations) =>
  (
    key: keyof (typeof translations)['en'],
    params?: Record<string, string | number>
  ): string => {
    const locale = getLocale();
    const localeTranslations =
      (translations as any)[locale] ?? translations['en'];
    const str =
      localeTranslations[key] ??
      (translations['en'] as any)[key] ??
      String(key);
    if (!params) return str;
    return Object.entries(params).reduce(
      (s, [k, v]) => s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v)),
      str
    );
  };

export const languageTranslations: Translations = {
  en,
  ru,
  uk,
  vi,
  tr,
};
