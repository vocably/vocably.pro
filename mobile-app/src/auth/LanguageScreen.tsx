import { useNavigation } from '@react-navigation/native';
import React, { FC, useState } from 'react';
import { ScrollView } from 'react-native';
import { Button, Divider, Text, useTheme } from 'react-native-paper';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SourceLanguageButton } from '../SourceLanguageButton';
import { mainPadding } from '../styles';
import { TargetLanguageButton } from '../TargetLanguageButton';
import { Preset } from '../TranslationPreset/TranslationPresetContainer';

type Props = {};

export const LanguageScreen: FC<Props> = () => {
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

  return (
    <ScrollView
      contentContainerStyle={{
        flex: 1,
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
          What is your mother{'\u00A0'}tongue?
        </Text>
        <Text style={{ textAlign: 'center' }}>
          Select the language you can speak.
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
            What language do you study?
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
            emptyText="Select"
          />
          <Text style={{ textAlign: 'center' }}>
            You can learn multiple languages. For now, just pick one to get
            started.
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
            onPress={() => navigation.navigate('survey')}
          >
            Next
          </Button>
        </Animated.View>
      )}
    </ScrollView>
  );
};
