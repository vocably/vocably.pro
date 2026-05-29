import { GoogleLanguage, Locale } from '@vocably/model';

import { ru } from './ru';
import { en } from './en';
import { uk } from './uk';
import { vi } from './vi';
import { tr } from './tr';
import { es } from './es';
import { pt } from './pt';

export type Translations = Record<Locale, Record<string, string>>;

export type LanguageTranslationOption =
  | `nominative_${GoogleLanguage}`
  | `nominative_short_${GoogleLanguage}`
  | `objective_${GoogleLanguage}`;

export const languageTranslations: Translations = {
  en,
  ru,
  uk,
  vi,
  tr,
  es,
  pt,
};
