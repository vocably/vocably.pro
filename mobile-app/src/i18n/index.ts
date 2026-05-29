import 'intl-pluralrules';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { detectInitialLocale } from './detectLocale';
import { languageTranslations } from '@vocably/i18n';

console.log('i18n: loading locales', languageTranslations);

// `require` (rather than ESM default import) sidesteps the local tsconfig's
// missing esModuleInterop relay; the bundler treats JSON imports the same way.
const en = {
  ...require('./locales/en.json'),
  language: languageTranslations.en,
};
const ru = {
  ...require('./locales/ru.json'),
  language: languageTranslations.ru,
};

import { DEFAULT_LOCALE } from './supportedLocales';

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ru: { translation: ru },
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
