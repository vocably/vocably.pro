import { en } from './en';
import { ru } from './ru';
import { tr } from './tr';
import { uk } from './uk';
import { vi } from './vi';
import { languageTranslations, Translations } from '@vocably/browser-i18n';

export const translations: Translations = {
  en: {
    ...en,
    ...languageTranslations['en'],
  },
  ru: {
    ...ru,
    ...languageTranslations['ru'],
  },
  uk: {
    ...uk,
    ...languageTranslations['uk'],
  },
  vi: {
    ...vi,
    ...languageTranslations['vi'],
  },
  tr: {
    ...tr,
    ...languageTranslations['tr'],
  },
};
