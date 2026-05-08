import { Route } from '@react-navigation/native';
import { GoogleLanguage, isGoogleLanguage } from '@vocably/model';
import { usePostHog } from 'posthog-react-native';
import React, { FC, useContext, useState } from 'react';
import { Platform, ScrollView, TextInput, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  createDefaultLanguageContainerDeck,
  saveDecksToStorage,
} from '../languages/LanguagesContainer';
import { mainPadding } from '../styles';
import { AuthContext } from './AuthContainer';
import { storeLanguagePairs } from '../TranslationPreset/useLanguagePairs';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

export type RouteParams = {
  sourceLanguage: GoogleLanguage;
  targetLanguage: GoogleLanguage;
};

type Props = {
  route: Route<string, any>;
};

const sources = [
  'Reddit',
  'LinkedIn',
  'Google',
  'AI',
  Platform.OS === 'android' ? 'Play Store' : 'App Store',
  'From a friend',
  'Other',
];

export const DiscoverySurveyScreen: FC<Props> = ({ route }) => {
  const { sourceLanguage, targetLanguage } = route.params as RouteParams;

  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const posthog = usePostHog();

  const { createAnonymousUser } = useContext(AuthContext);

  const [showOther, setShowOther] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [otherSource, setOtherSource] = useState('');

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
          How did you hear about Vocably?
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
              mode={selectedSource === source ? 'contained' : 'outlined'}
              key={source}
              onPress={() => onSelect(source)}
            >
              {source}
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
            <Text>What is it?</Text>
            <View
              style={{
                backgroundColor: theme.colors.elevation.level5,
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
              />
            </View>
            <Button mode="elevated" elevation={1} onPress={onNext}>
              Next
            </Button>
          </Animated.View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
