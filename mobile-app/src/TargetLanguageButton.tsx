import { NavigationProp } from '@react-navigation/native';
import { languageList } from '@vocably/model';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleProp, ViewStyle } from 'react-native';
import { Button } from 'react-native-paper';
import { getDeviceLanguage } from './getDeviceLanguage';
import { Preset } from './TranslationPreset/TranslationPresetContainer';
import { LanguagePairs } from './TranslationPreset/useLanguagePairs';
import { upperFirst } from 'lodash-es';

const deviceLanguage = getDeviceLanguage();

type Props = {
  navigation: NavigationProp<any>;
  preset: Preset;
  onChange: (preset: Preset) => void;
  languagePairs: LanguagePairs;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
};

export const TargetLanguageButton: FC<Props> = ({
  navigation,
  preset,
  onChange,
  languagePairs,
  style,
  compact = false,
}) => {
  const { t } = useTranslation();
  const onTranslationSelection = (translationLanguage: string) => {
    onChange({
      ...preset,
      translationLanguage,
    });
  };

  // @ts-ignore
  const preferredLanguages = languagePairs[preset.sourceLanguage]
    ? // @ts-ignore
      languagePairs[preset.sourceLanguage].availableLanguages
    : // @ts-ignore
      languageList[deviceLanguage]
      ? [deviceLanguage]
      : [];

  // @ts-ignore
  const preferredLanguagesTitle =
    // @ts-ignore
    !preset.translationLanguage && languageList[deviceLanguage]
      ? t('languageSelector.deviceLanguage')
      : t('languageSelector.preferredLanguages');

  const selectTranslationLanguage = () => {
    navigation.navigate('LanguageSelector', {
      title: t('languageSelector.motherTongue'),
      // @ts-ignore
      preferred: preferredLanguages,
      preferredTitle: preferredLanguagesTitle,
      selected: preset.translationLanguage,
      onSelect: onTranslationSelection,
    });
  };

  return (
    <Button
      style={style}
      contentStyle={
        compact && {
          height: 'auto',
          paddingVertical: 0,
          paddingHorizontal: 8,
        }
      }
      labelStyle={
        compact && {
          marginVertical: 2,
          marginHorizontal: 0,
          fontSize: 12,
        }
      }
      mode="outlined"
      onPress={selectTranslationLanguage}
      compact={false}
    >
      {preset.translationLanguage
        ? upperFirst(
            t(`language.nominative_short_${preset.translationLanguage}`)
          )
        : t('languageSelector.select')}
    </Button>
  );
};
