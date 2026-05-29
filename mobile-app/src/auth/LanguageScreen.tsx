import { useNavigation } from '@react-navigation/native';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';
import { Button, Divider, Text, useTheme } from 'react-native-paper';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { saveSelectedLanguageToStorage } from '../languages/LanguagesContainer';
import { SourceLanguageButton } from '../SourceLanguageButton';
import { mainPadding } from '../styles';
import { TargetLanguageButton } from '../TargetLanguageButton';
import { Preset } from '../TranslationPreset/TranslationPresetContainer';
import { storeSelectedLanguage } from '../TranslationPreset/useTranslationPresetSelectedLanguage';

type Props = {};

export const LanguageScreen: FC<Props> = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [sourceLanguage, setSourceLanguage] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('');

  const onSourceLanguageChange = async (preset: Preset) => {
    setSourceLanguage(preset.sourceLanguage);
  };
  const onTargetLanguageChange = async (preset: Preset) => {
    setTargetLanguage(preset.translationLanguage);
  };

  const savePreferencesAndProceed = async () => {
    await storeSelectedLanguage(sourceLanguage);
    await saveSelectedLanguageToStorage(sourceLanguage);

    navigation.navigate('discovery', {
      sourceLanguage: sourceLanguage,
      targetLanguage: targetLanguage,
    });
  };

  return (
    <ScrollView
      style={{
        flex: 1,
      }}
      contentContainerStyle={{
        flexGrow: 1,
        alignItems: 'stretch',
        justifyContent: 'center',
        paddingLeft: insets.left + mainPadding,
        paddingRight: insets.right + mainPadding,
        gap: 16,
      }}
    >
      <Animated.View entering={FadeInDown} style={{ gap: 8 }}>
        <Text
          style={{
            fontSize: 24,
            color: theme.colors.onBackground,
            textAlign: 'center',
          }}
        >
          {t('languageScreen.motherTongueQuestion')}
        </Text>
        <Text style={{ textAlign: 'center' }}>
          {t('languageScreen.motherTongueHint')}
        </Text>
        <TargetLanguageButton
          navigation={navigation}
          preset={{
            sourceLanguage: sourceLanguage,
            translationLanguage: targetLanguage,
            isReverse: false,
          }}
          onChange={onTargetLanguageChange}
          languagePairs={{}}
        />
      </Animated.View>
      {targetLanguage && (
        <Animated.View
          entering={FadeInDown}
          style={{
            marginTop: 24,
            gap: 8,
          }}
        >
          <Divider style={{ marginBottom: 24 }} />
          <Text
            style={{
              fontSize: 24,
              color: theme.colors.onBackground,
              textAlign: 'center',
            }}
          >
            {t('welcome.questionStudyLanguage')}
          </Text>
          <SourceLanguageButton
            navigation={navigation}
            existingLanguages={[]}
            preset={{
              sourceLanguage: sourceLanguage,
              translationLanguage: '',
              isReverse: false,
            }}
            onChange={onSourceLanguageChange}
            languagePairs={{}}
            emptyText={t('languageSelector.select')}
          />
          <Text style={{ textAlign: 'center' }}>
            {t('welcome.multipleLanguagesHint')}
          </Text>
        </Animated.View>
      )}
      {targetLanguage && sourceLanguage && (
        <Animated.View
          entering={FadeInDown}
          style={{
            marginTop: 24,
            gap: 32,
          }}
        >
          <Divider />
          <Button
            mode="elevated"
            elevation={2}
            onPress={savePreferencesAndProceed}
          >
            {t('welcome.next')}
          </Button>
        </Animated.View>
      )}
    </ScrollView>
  );
};
