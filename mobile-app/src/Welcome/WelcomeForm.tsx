import { useNavigation } from '@react-navigation/native';
import { FC, useContext } from 'react';
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
          To get started, please answer a few questions.
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
            What language do you study?
          </Text>
          <View style={{ width: '100%' }}>
            <SourceLanguageButton
              navigation={navigation}
              preset={translationPresetState.preset}
              onChange={onSourceLanguageChange}
              languagePairs={translationPresetState.languagePairs}
              emptyText="Select"
              existingLanguages={languages}
            />
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text>
            You can learn multiple languages. For now, just pick one to get
            started.
          </Text>
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
                What is your mother{'\u00A0'}tongue?
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
