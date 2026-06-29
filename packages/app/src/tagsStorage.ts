export type LanguageTagStorage = {
  noTags: boolean;
  tagIds: string[];
};

export const getLanguageTagStorage = (language: string): LanguageTagStorage =>
  JSON.parse(
    localStorage.getItem(`tagStorage.${language}`) ??
      JSON.stringify({ noTags: false, tagIds: [] } as LanguageTagStorage)
  );

export const setLanguageTagStorage = (
  language: string,
  storage: LanguageTagStorage
) => localStorage.setItem(`tagStorage.${language}`, JSON.stringify(storage));
