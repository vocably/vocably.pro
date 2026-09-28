import type { GoogleLanguage } from '../../packages/model/src/language';
import type { Language } from './languages';

type FlagSet = {
  // The study languages shown off on the first screenshot, in display order.
  languages: readonly GoogleLanguage[];
};

const defaultLanguages: readonly GoogleLanguage[] = [
  'en-GB',
  'fr',
  'de',
  'it',
  'es',
  'pt',
  'ja',
  'no',
];

// Swaps `from` for `to`, keeping its position.
const replaceLanguage = (from: GoogleLanguage, to: GoogleLanguage) =>
  defaultLanguages.map((language) => (language === from ? to : language));

// The flags each interface language's screenshots show.
export const flags: Record<Language, FlagSet> = {
  en: { languages: defaultLanguages },
  es: { languages: replaceLanguage('es', 'nl') },
  pt: { languages: replaceLanguage('pt', 'nl') },
  ru: { languages: defaultLanguages },
  uk: { languages: defaultLanguages },
  tr: { languages: defaultLanguages },
  vi: { languages: defaultLanguages },
};
