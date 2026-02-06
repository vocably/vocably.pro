import { GoogleLanguage } from '@vocably/model';
import * as asyncAppStorage from '../asyncAppStorage';
import { AsyncResult, useAsync } from '../useAsync';

type LanguageSetting = {
  translationLanguage: GoogleLanguage;
  availableLanguages: GoogleLanguage[];
};

export type LanguagePairs = Partial<Record<GoogleLanguage, LanguageSetting>>;

const loadLanguagePairs = async (): Promise<LanguagePairs> => {
  return asyncAppStorage
    .getItem('languagePairs')
    .then((languagePairsString) => {
      if (!languagePairsString) {
        return {};
      }

      return JSON.parse(languagePairsString);
    });
};

export const storeLanguagePairs = async (languagePairs: LanguagePairs) => {
  return asyncAppStorage.setItem(
    'languagePairs',
    JSON.stringify(languagePairs)
  );
};

export const useLanguagePairs = (): [
  languagePairsResult: AsyncResult<LanguagePairs>,
  saveLanguagePairs: (languageParis: LanguagePairs) => Promise<unknown>
] => {
  return useAsync(loadLanguagePairs, storeLanguagePairs);
};
