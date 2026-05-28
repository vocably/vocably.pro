export type SupportedLocale = 'en' | 'ru';

export const SUPPORTED_LOCALES: ReadonlyArray<{
  code: SupportedLocale;
  label: string;
}> = [
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
];

export const SUPPORTED_LOCALE_CODES: ReadonlyArray<SupportedLocale> =
  SUPPORTED_LOCALES.map((l) => l.code);

export const DEFAULT_LOCALE: SupportedLocale = 'en';

export const isSupportedLocale = (value: unknown): value is SupportedLocale =>
  typeof value === 'string' &&
  (SUPPORTED_LOCALE_CODES as ReadonlyArray<string>).includes(value);

export const getLocaleLabel = (code: string): string =>
  SUPPORTED_LOCALES.find((l) => l.code === code)?.label ?? code;
