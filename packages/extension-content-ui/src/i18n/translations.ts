import { en } from './en';
import { ru } from './ru';
import { tr } from './tr';
import { uk } from './uk';
import { vi } from './vi';
import { es } from './es';
import { pt } from './pt';
import {
  languageTranslations,
  messageTranslations,
  Translations,
} from '@vocably/browser-i18n';

export const translations: Translations = {
  en: {
    ...en,
    ...languageTranslations['en'],
    ...messageTranslations['en'],
  },
  ru: {
    ...ru,
    ...languageTranslations['ru'],
    ...messageTranslations['ru'],
  },
  uk: {
    ...uk,
    ...languageTranslations['uk'],
    ...messageTranslations['uk'],
  },
  vi: {
    ...vi,
    ...languageTranslations['vi'],
    ...messageTranslations['vi'],
  },
  tr: {
    ...tr,
    ...languageTranslations['tr'],
    ...messageTranslations['tr'],
  },
  es: {
    ...es,
    ...languageTranslations['es'],
    ...messageTranslations['es'],
  },
  pt: {
    ...pt,
    ...languageTranslations['pt'],
    ...messageTranslations['pt'],
  },
};
