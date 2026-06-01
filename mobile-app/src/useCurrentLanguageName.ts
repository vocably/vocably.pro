import { useContext } from 'react';
import { LanguagesContext } from './languages/LanguagesContainer';
import { i18n } from './i18n';

export const useCurrentLanguageName = (): string => {
  const { selectedLanguage } = useContext(LanguagesContext);
  return i18n.t(`language.nominative_short_${selectedLanguage}`, '');
};
