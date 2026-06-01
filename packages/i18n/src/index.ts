import { GoogleLanguage, Locale } from '@vocably/model';

import { ru } from './ru';
import { en } from './en';
import { uk } from './uk';
import { vi } from './vi';
import { tr } from './tr';
import { es } from './es';
import { pt } from './pt';

export type Translations = Record<Locale, Record<string, string>>;

type PartOfSpeech =
  | 'noun'
  | 'pronoun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'preposition'
  | 'conjunction'
  | 'interjection'
  | 'article'
  | 'determiner'
  | 'quantifier'
  | 'numeral'
  | 'participle'
  | 'gerund'
  | 'infinitive'
  | 'auxiliary'
  | 'modal'
  | 'complementizer'
  | 'postposition'
  | 'classifier'
  | 'particle'
  | 'proverb'
  | 'proadverb'
  | 'proadjective'
  | 'ideophone'
  | 'expletive'
  | 'subordinator'
  | 'coordinator'
  | 'interrogative'
  | 'relative'
  | 'phrase'
  | 'sentence'
  | 'phrasal verb'
  | 'modal verb'
  | 'idiom';

export type LanguageTranslationOption =
  | `nominative_${GoogleLanguage}`
  | `nominative_short_${GoogleLanguage}`
  | `objective_${GoogleLanguage}`
  | `in_${GoogleLanguage}`
  | PartOfSpeech;

export const languageTranslations: Translations = {
  en,
  ru,
  uk,
  vi,
  tr,
  es,
  pt,
};
