import { Locale, parseLocale } from '@vocably/model';
import { AuthEmailTranslation, en } from './en';
import { es } from './es';
import { pt } from './pt';
import { ru } from './ru';
import { tr } from './tr';
import { uk } from './uk';
import { vi } from './vi';
import { zhTW } from './zh-TW';

export { AuthEmailTranslation } from './en';

const translations: Record<Locale, AuthEmailTranslation> = {
  en,
  ru,
  uk,
  vi,
  tr,
  es,
  pt,
  'zh-TW': zhTW,
};

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
    // Tolerate "ru-RU", "PT" and "zh-Hant-TW" alike.
    const locale = parseLocale(candidate);

    if (locale) {
      return { locale, translation: translations[locale] };
    }
  }

  return { locale: 'en', translation: en };
};
