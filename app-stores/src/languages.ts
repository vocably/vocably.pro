// The languages Vocably's interface is translated into.
// The code becomes the language folder name in the exported ZIP.
export const languages = ['en', 'ru', 'uk', 'es', 'pt', 'tr', 'vi'] as const;

export type Language = (typeof languages)[number];

export const languageNames: Record<Language, string> = {
  en: 'English',
  ru: 'Russian',
  uk: 'Ukrainian',
  es: 'Spanish',
  pt: 'Portuguese',
  tr: 'Turkish',
  vi: 'Vietnamese',
};
