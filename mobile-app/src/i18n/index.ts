import 'intl-pluralrules';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { detectInitialLocale } from './detectLocale';
import { languageTranslations } from '@vocably/i18n';
import { DEFAULT_LOCALE } from './supportedLocales';
import { MakeFlexibleSchema } from './types';

import en from './locales/en';
export type BaseTranslations = MakeFlexibleSchema<typeof en>;

import es from './locales/es';
import pt from './locales/pt';
import ru from './locales/ru';
import tr from './locales/tr';
import uk from './locales/uk';
import vi from './locales/vi';

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
    pt: { translation: pt },
    ru: { translation: ru },
    tr: { translation: tr },
    uk: { translation: uk },
    vi: { translation: vi },
  },
  lng: detectInitialLocale(),
  fallbackLng: DEFAULT_LOCALE,
  defaultNS: 'translation',
  // RN doesn't render HTML; disabling escapes keeps interpolated values intact.
  interpolation: { escapeValue: false },
  returnNull: false,
  // ICU plural categories — required for Russian few/many.
  compatibilityJSON: 'v4',
  // Resources are sync-bundled JSON; we don't need React Suspense.
  react: { useSuspense: false },
});

export { i18n };
export default i18n;
