import { NavigationProp } from '@react-navigation/native';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleProp, ViewStyle } from 'react-native';
import { Button } from 'react-native-paper';
import { Preset } from './LookUpScreen/TranslationPresetForm';
import { LanguagePairs } from './TranslationPreset/useLanguagePairs';
import { upperFirst } from 'lodash-es';

type Props = {
  navigation: NavigationProp<any>;
  preset: Preset;
  onChange: (preset: Preset) => void;
  languagePairs: LanguagePairs;
  existingLanguages: string[];
  emptyText?: string;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
};

export const popularLanguages = [
  'en',
  'en-GB',
  'de',
  'pt',
  'es',
  'nl',
  'fr',
  'it',
  'ja',
  'no',
  'da',
];

export const setSourceLanguage = (
  sourceLanguage: string,
  currentPreset: Preset,
  languagePairs: LanguagePairs
): Preset => {
  return {
    ...currentPreset,
    sourceLanguage,
    // @ts-ignore
    translationLanguage: languagePairs[sourceLanguage]
      ? // @ts-ignore
        languagePairs[sourceLanguage].translationLanguage
      : currentPreset.translationLanguage,
  };
};

export const SourceLanguageButton: FC<Props> = ({
  navigation,
  preset,
  onChange,
  languagePairs,
  emptyText,
  style,
  compact = false,
  existingLanguages,
}) => {
  const { t } = useTranslation();
  const resolvedEmptyText = emptyText ?? t('languageSelector.select');
  const onSourceSelection = (sourceLanguage: string) => {
    onChange(setSourceLanguage(sourceLanguage, preset, languagePairs));
  };

  const selectSourceLanguage = () => {
    navigation.navigate('LanguageSelector', {
      title: t('languageSelector.studyLanguage'),
      selected: preset.sourceLanguage,
      preferred:
        existingLanguages.length === 0 ? popularLanguages : existingLanguages,
      preferredTitle:
        existingLanguages.length > 0
          ? t('languageSelector.yourLanguages')
          : t('languageSelector.popularLanguages'),
      onSelect: onSourceSelection,
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
      mode={'contained'}
      onPress={selectSourceLanguage}
      compact={compact}
    >
      {preset.sourceLanguage
        ? upperFirst(t(`language.nominative_short_${preset.sourceLanguage}`))
        : resolvedEmptyText}
    </Button>
  );
};
