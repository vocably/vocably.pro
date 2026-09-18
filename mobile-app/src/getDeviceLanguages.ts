import { GoogleLanguage, isGoogleLanguage } from '@vocably/model';
import * as RNLocalize from 'react-native-localize';
import { uniq } from 'lodash-es';

export const getDeviceLanguages = (): GoogleLanguage[] => {
  return uniq(
    RNLocalize.getLocales()
      .map((locale) => locale?.languageTag ?? 'en-US')
      .map((languageTag) =>
        isGoogleLanguage(languageTag)
          ? languageTag
          : languageTag.substring(0, 2)
      )
      .filter(isGoogleLanguage)
  );
};
