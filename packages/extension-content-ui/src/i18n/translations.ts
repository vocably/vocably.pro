import { en } from './en';
import { ru } from './ru';
import { tr } from './tr';
import { uk } from './uk';
import { vi } from './vi';
import { es } from './es';
import { pt } from './pt';
import { zh } from './zh';
import { zhTW } from './zh-TW';
import {
  languageTranslations,
  messageTranslations,
  Translations,
} from '@vocably/browser-i18n';
import { languageTranslations as sharedLanguageTranslations } from '@vocably/i18n';
import { Locale } from '@vocably/model';

// Shared with the mobile app, which reads them as `language.<key>`. The prefix
// keeps them apart from the browser-i18n language names, whose keys overlap.
const sharedLanguage = (locale: Locale): Record<string, string> =>
  Object.fromEntries(
    Object.entries(sharedLanguageTranslations[locale]).map(([key, value]) => [
      `language.${key}`,
      value,
    ])
  );

export const translations: Translations = {
  en: {
    ...en,
    ...sharedLanguage('en'),
    ...languageTranslations['en'],
    ...messageTranslations['en'],
  },
  ru: {
    ...ru,
    ...sharedLanguage('ru'),
    ...languageTranslations['ru'],
    ...messageTranslations['ru'],
  },
  uk: {
    ...uk,
    ...sharedLanguage('uk'),
    ...languageTranslations['uk'],
    ...messageTranslations['uk'],
  },
  vi: {
    ...vi,
    ...sharedLanguage('vi'),
    ...languageTranslations['vi'],
    ...messageTranslations['vi'],
  },
  tr: {
    ...tr,
    ...sharedLanguage('tr'),
    ...languageTranslations['tr'],
    ...messageTranslations['tr'],
  },
  es: {
    ...es,
    ...sharedLanguage('es'),
    ...languageTranslations['es'],
    ...messageTranslations['es'],
  },
  pt: {
    ...pt,
    ...sharedLanguage('pt'),
    ...languageTranslations['pt'],
    ...messageTranslations['pt'],
  },
  zh: {
    ...zh,
    ...sharedLanguage('zh'),
    ...languageTranslations['zh'],
    ...messageTranslations['zh'],
  },
  'zh-TW': {
    ...zhTW,
    ...sharedLanguage('zh-TW'),
    ...languageTranslations['zh-TW'],
    ...messageTranslations['zh-TW'],
  },
};
