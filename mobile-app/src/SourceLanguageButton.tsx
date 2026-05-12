import { NavigationProp } from '@react-navigation/native';
import {
  GoogleLanguage,
  languageList,
  shortenedLanguageList,
} from '@vocably/model';
import { FC } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { Button } from 'react-native-paper';
import { Preset } from './LookUpScreen/TranslationPresetForm';
import { LanguagePairs } from './TranslationPreset/useLanguagePairs';

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
  emptyText = 'Select',
  style,
  compact = false,
  existingLanguages,
}) => {
  const onSourceSelection = (sourceLanguage: string) => {
    onChange(setSourceLanguage(sourceLanguage, preset, languagePairs));
  };

  const selectSourceLanguage = () => {
    navigation.navigate('LanguageSelector', {
      title: 'Study Language',
      selected: preset.sourceLanguage,
      preferred:
        existingLanguages.length === 0 ? popularLanguages : existingLanguages,
      preferredTitle:
        existingLanguages.length > 0 ? 'Your languages' : 'Popular Languages',
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
        ? (shortenedLanguageList[preset.sourceLanguage as GoogleLanguage] ??
          languageList[preset.sourceLanguage as GoogleLanguage])
        : emptyText}
    </Button>
  );
};
