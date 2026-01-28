import { useNavigation } from '@react-navigation/native';
import React, { FC, useState } from 'react';
import { ScrollView, View } from 'react-native';
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
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: insets.left + mainPadding,
        paddingRight: insets.right + mainPadding,
      }}
    >
      <View
        style={{
          gap: 16,
        }}
      >
        <View
          style={{
            alignItems: 'center',
            gap: 16,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              color: theme.colors.onBackground,
            }}
          >
            What language do you study?
          </Text>
          <View style={{ width: '100%' }}>
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
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ textAlign: 'center' }}>
            You can learn multiple languages. For now, just pick one to get
            started.
          </Text>
        </View>
        {sourceLanguage && (
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
                  fontSize: 24,
                  color: theme.colors.onBackground,
                }}
              >
                What is your mother{'\u00A0'}tongue?
              </Text>
              <View style={{ width: '100%' }}>
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
              </View>
            </View>
          </Animated.View>
        )}
        {targetLanguage && (
          <Animated.View
            entering={FadeInDown}
            style={{
              marginTop: 24,
              gap: 32,
            }}
          >
            <Divider style={{ width: '100%' }} />
            <Button
              mode="elevated"
              elevation={2}
              onPress={() => navigation.navigate('survey')}
            >
              Next
            </Button>
          </Animated.View>
        )}
      </View>
    </ScrollView>
  );
};
