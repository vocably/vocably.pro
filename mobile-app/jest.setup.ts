import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './src/i18n/locales/en';

// The app's own `src/i18n` detects the device locale through a native module,
// so components under test get the same i18next setup with English resources.
void i18n.use(initReactI18next).init({
  lng: 'en',
  resources: { en: { translation: en } },
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v4',
  react: { useSuspense: false },
});
