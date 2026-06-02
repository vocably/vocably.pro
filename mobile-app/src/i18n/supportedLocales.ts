export type SupportedLocale = 'en' | 'ru' | 'pt' | 'es' | 'uk' | 'vi' | 'tr';

export const SUPPORTED_LOCALES: ReadonlyArray<{
  code: SupportedLocale;
  label: string;
}> = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'pt', label: 'Português (Brasil)' },
  { code: 'ru', label: 'Русский' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'uk', label: 'Українська' },
  { code: 'vi', label: 'Tiếng Việt' },
];

export const SUPPORTED_LOCALE_CODES: ReadonlyArray<SupportedLocale> =
  SUPPORTED_LOCALES.map((l) => l.code);

export const DEFAULT_LOCALE: SupportedLocale = 'en';

export const isSupportedLocale = (value: unknown): value is SupportedLocale =>
  typeof value === 'string' &&
  (SUPPORTED_LOCALE_CODES as ReadonlyArray<string>).includes(value);

export const getLocaleLabel = (code: string): string =>
  SUPPORTED_LOCALES.find((l) => l.code === code)?.label ?? code;
