import { Locale } from '@vocably/model';
import { AuthEmailTranslation, en } from './en';
import { es } from './es';
import { pt } from './pt';
import { ru } from './ru';
import { tr } from './tr';
import { uk } from './uk';
import { vi } from './vi';

export { AuthEmailTranslation } from './en';

const translations: Record<Locale, AuthEmailTranslation> = {
  en,
  ru,
  uk,
  vi,
  tr,
  es,
  pt,
};

const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && value in translations;

/**
 * Managed login never forwards clientMetadata, and a brand new user has no
 * `locale` attribute yet, so English remains a real possibility rather than a
 * theoretical fallback.
 */
export const resolveTranslation = (
  clientMetadata: Record<string, string> | undefined,
  userAttributes: Record<string, string> | undefined
): { locale: Locale; translation: AuthEmailTranslation } => {
  const candidates = [clientMetadata?.locale, userAttributes?.locale];

  for (const candidate of candidates) {
    // Tolerate "ru-RU" and "PT" alike.
    const normalized = (candidate ?? '').toLowerCase().split(/[-_]/)[0];

    if (isLocale(normalized)) {
      return { locale: normalized, translation: translations[normalized] };
    }
  }

  return { locale: 'en', translation: en };
};
