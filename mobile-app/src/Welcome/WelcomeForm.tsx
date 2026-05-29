import { useNavigation } from '@react-navigation/native';
import { FC, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Divider, Text, useTheme } from 'react-native-paper';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LanguagesContext } from '../languages/LanguagesContainer';
import { SourceLanguageButton } from '../SourceLanguageButton';
import { TargetLanguageButton } from '../TargetLanguageButton';
import { Preset } from '../TranslationPreset/TranslationPresetContainer';
import { useWelcomeTranslationPreset } from './useWelcomeTranslationPreset';
import { WelcomeScrollView } from './WelcomeScrollView';

type Props = {};

export const WelcomeForm: FC<Props> = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation();
  const translationPresetState = useWelcomeTranslationPreset();
  const { languages, selectLanguage, addNewLanguage } =
    useContext(LanguagesContext);

  if (translationPresetState.status === 'unknown') {
    return <></>;
  }

  const onSourceLanguageChange = async (preset: Preset) => {
    await translationPresetState.setPreset(preset);
    if (languages.includes(preset.sourceLanguage)) {
      await selectLanguage(preset.sourceLanguage);
      return;
    }

    return addNewLanguage(preset.sourceLanguage);
  };

  return (
    <WelcomeScrollView>
      <View
        style={{
          gap: 16,
        }}
      >
        <Text style={{ textAlign: 'center', fontSize: 24, marginBottom: 24 }}>
          {t('welcome.formIntro')}
        </Text>

        <View
          style={{
            alignItems: 'center',
            gap: 16,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              color: theme.colors.onBackground,
            }}
          >
            {t('welcome.questionStudyLanguage')}
          </Text>
          <View style={{ width: '100%' }}>
            <SourceLanguageButton
              navigation={navigation}
              preset={translationPresetState.preset}
              onChange={onSourceLanguageChange}
              languagePairs={translationPresetState.languagePairs}
              emptyText={t('languageSelector.select')}
              existingLanguages={languages}
            />
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text>{t('welcome.multipleLanguagesHint')}</Text>
        </View>
        {translationPresetState.preset.sourceLanguage && (
          <Animated.View
            entering={FadeInDown}
            style={{
              gap: 16,
            }}
          >
            <Divider style={{ width: '100%' }} />
            <View
              style={{
                alignItems: 'center',
                gap: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  color: theme.colors.onBackground,
                }}
              >
                {t('languageScreen.motherTongueQuestion')}
              </Text>
              <View style={{ width: '100%' }}>
                <TargetLanguageButton
                  navigation={navigation}
                  preset={translationPresetState.preset}
                  onChange={translationPresetState.setPreset}
                  languagePairs={translationPresetState.languagePairs}
                />
              </View>
            </View>
          </Animated.View>
        )}
      </View>
    </WelcomeScrollView>
  );
};
