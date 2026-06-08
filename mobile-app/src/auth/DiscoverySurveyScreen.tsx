import { Route } from '@react-navigation/native';
import { GoogleLanguage, isGoogleLanguage } from '@vocably/model';
import { usePostHog } from 'posthog-react-native';
import React, { FC, useContext, useState } from 'react';
import { Platform, ScrollView, TextInput, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
  createDefaultLanguageContainerDeck,
  saveDecksToStorage,
} from '../languages/LanguagesContainer';
import { mainPadding } from '../styles';
import { AuthContext } from './AuthContainer';
import { storeLanguagePairs } from '../TranslationPreset/useLanguagePairs';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { AppTheme } from '../ThemeProvider';

export type RouteParams = {
  sourceLanguage: GoogleLanguage;
  targetLanguage: GoogleLanguage;
};

type Props = {
  route: Route<string, any>;
};

export const DiscoverySurveyScreen: FC<Props> = ({ route }) => {
  const { sourceLanguage, targetLanguage } = route.params as RouteParams;

  const theme = useTheme() as AppTheme;
  const insets = useSafeAreaInsets();
  const posthog = usePostHog();
  const { t } = useTranslation();

  const { createAnonymousUser } = useContext(AuthContext);

  const [showOther, setShowOther] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [otherSource, setOtherSource] = useState('');

  const sources = [
    { value: 'Reddit', label: 'Reddit' },
    { value: 'LinkedIn', label: 'LinkedIn' },
    { value: 'Google', label: 'Google' },
    { value: 'AI', label: 'AI' },
    {
      value: Platform.OS === 'android' ? 'Play Store' : 'App Store',
      label:
        Platform.OS === 'android'
          ? t('discoverySurvey.sources.playStore')
          : t('discoverySurvey.sources.appStore'),
    },
    { value: 'From a friend', label: t('discoverySurvey.sources.fromAFriend') },
    { value: 'Other', label: t('discoverySurvey.sources.other') },
  ];

  const startUsingTheApp = async (source?: string) => {
    if (isGoogleLanguage(sourceLanguage) && isGoogleLanguage(targetLanguage))
      await storeLanguagePairs({
        [sourceLanguage]: {
          translationLanguage: targetLanguage,
          availableLanguages: [targetLanguage],
        },
      });

    await createAnonymousUser();
    await saveDecksToStorage({
      [sourceLanguage]: createDefaultLanguageContainerDeck(sourceLanguage),
    });

    posthog.capture('anonymous-registration-form-subbmitted', {
      nativeLanguage: targetLanguage,
      studyLanguage: sourceLanguage,
      mobileOS: Platform.OS,
      discovered: source ?? selectedSource,
      discoveredOther: otherSource,
    });

    posthog.capture('$set', {
      $set: {
        nativeLanguage: targetLanguage,
        studyLanguage: sourceLanguage,
        mobileOS: Platform.OS,
        discovered: source ?? selectedSource,
        discoveredOther: otherSource,
      },
    });
  };

  const onSelect = async (source: string) => {
    setSelectedSource(source);
    if (source !== 'Other') {
      await startUsingTheApp(source);
      return;
    }

    setShowOther(true);
  };

  const onNext = async () => {
    await startUsingTheApp();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'android' ? 64 : 94}
    >
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
          paddingBottom: 24,
          gap: 16,
        }}
      >
        <Text
          style={{
            textAlign: 'center',
            fontSize: 18,
            color: theme.colors.secondary,
          }}
        >
          {t('discoverySurvey.question')}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          {sources.map((source) => (
            <Button
              mode={selectedSource === source.value ? 'contained' : 'outlined'}
              key={source.value}
              onPress={() => onSelect(source.value)}
            >
              {source.label}
            </Button>
          ))}
        </View>
        {showOther && (
          <Animated.View
            entering={FadeInDown}
            style={{
              marginTop: 24,
              gap: 16,
            }}
          >
            <Text>{t('discoverySurvey.whatIsIt')}</Text>
            <View
              style={{
                backgroundColor: theme.colors.inputBgFocused,
                padding: 16,
                borderRadius: 16,
                width: '100%',
              }}
            >
              <TextInput
                autoFocus={true}
                value={otherSource}
                onChangeText={setOtherSource}
                onSubmitEditing={onNext}
                returnKeyType="done"
                placeholder={t('discoverySurvey.typePlaceholder')}
                style={{
                  fontSize: 18,
                  color: theme.colors.onBackground,
                }}
                placeholderTextColor={theme.colors.tertiary}
              />
            </View>
            <Button mode="elevated" elevation={1} onPress={onNext}>
              {t('welcome.next')}
            </Button>
          </Animated.View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
