import { useContext } from 'react';
import * as asyncAppStorage from '../asyncAppStorage';
import { LanguagesContext } from '../languages/LanguagesContainer';
import { AsyncResult, useAsync } from '../useAsync';

const loadSelectedLanguage = async (): Promise<string | undefined> => {
  return asyncAppStorage.getItem('translationPresetSelectedLanguage');
};

export const storeSelectedLanguage = async (
  language: string | undefined
): Promise<void> => {
  if (language === undefined) {
    return asyncAppStorage.removeItem('translationPresetSelectedLanguage');
  }
  await asyncAppStorage.setItem('translationPresetSelectedLanguage', language);
};

export const useTranslationPresetSelectedLanguage = (): AsyncResult<{
  selectedLanguage: string;
  saveSelectedLanguage: (language: string) => Promise<unknown>;
}> => {
  const { selectedLanguage: dashboardLanguage } = useContext(LanguagesContext);
  const [selectedLanguageResult, setSelectedLanguage] = useAsync(
    loadSelectedLanguage,
    storeSelectedLanguage
  );

  if (selectedLanguageResult.status !== 'loaded') {
    return selectedLanguageResult;
  }

  return {
    status: 'loaded',
    value: {
      selectedLanguage: selectedLanguageResult.value ?? dashboardLanguage,
      saveSelectedLanguage: (language: string) => setSelectedLanguage(language),
    },
  };
};
