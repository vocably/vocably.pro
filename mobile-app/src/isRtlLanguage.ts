const RTL_LANGUAGES = ['ar', 'he', 'iw', 'fa', 'ps', 'sd', 'ur', 'ug', 'yi'];

export const isRtlLanguage = (language: string): boolean =>
  RTL_LANGUAGES.includes(language);
