import { NavigationProp } from '@react-navigation/native';
import { analyze } from '@vocably/api';
import { AnalyzePayload, GoogleLanguage } from '@vocably/model';
import { usePostHog } from 'posthog-react-native';
import { FC, useEffect, useRef, useState } from 'react';
import { Alert, Keyboard, Linking, ScrollView, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { Button, Surface, Text, useTheme } from 'react-native-paper';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { CardSkeletonLoader } from './CardSkeletonLoader';
import { exitSharedScreen } from './exitSharedScreen';
import { useLanguageDeck } from './languageDeck/useLanguageDeck';
import { Loader } from './loaders/Loader';
import { AnalyzeResult } from './LookUpScreen/AnalyzeResult';
import { TranslationPresetForm } from './LookUpScreen/TranslationPresetForm';
import { SearchInput, SearchInputRef } from './SearchInput';
import { mainPadding } from './styles';
import { Preset } from './TranslationPreset/TranslationPresetContainer';
import { useTranslationPreset } from './TranslationPreset/useTranslationPreset';
import { ScreenLayout } from './ui/ScreenLayout';
import { useAnalyzeOperations } from './useAnalyzeOperations';
import { useCardsLimit } from './useCardsLimit';

const padding = 16;

type Props = {
  navigation: NavigationProp<any>;
  initialText?: string;
  isSharedLookUp?: boolean;
};

export const LookUpScreen: FC<Props> = ({
  navigation,
  initialText = '',
  isSharedLookUp = false,
}) => {
  const translationPresetState = useTranslationPreset();
  const [lookUpText, setLookUpText] = useState(initialText);
  const [generateIsOpened, setGenerateIsOpened] = useState(false);
  const [isAnalyzingPreset, setIsAnalyzingPreset] = useState<Preset | false>(
    false
  );
  const [lookUpResult, setLookupResult] =
    useState<Awaited<ReturnType<typeof analyze>>>();
  const theme = useTheme();
  const deck = useLanguageDeck({
    language:
      translationPresetState.status === 'known'
        ? translationPresetState.preset.sourceLanguage
        : '',
    autoReload: true,
  });

  const insets = useSafeAreaInsets();

  const cardsLimit = useCardsLimit();

  const posthog = usePostHog();

  const cancelThePreviousLookUp = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
    }

    setIsAnalyzingPreset(false);
  };

  const searchInputRef = useRef<SearchInputRef>(null);

  useEffect(() => {
    return navigation.addListener('focus', () => {
      if (searchInputRef.current && !generateIsOpened) {
        searchInputRef.current.focus();
      }

      setGenerateIsOpened(false);
    });
  }, [generateIsOpened]);

  useEffect(() => {
    if (lookUpText === '') {
      cancelThePreviousLookUp();
      setLookupResult(undefined);
    }
  }, [lookUpText]);

  const abortControllerRef = useRef<AbortController | null>(null);

  const lookUp = async () => {
    cancelThePreviousLookUp();

    if (!lookUpText) {
      return;
    }

    if (translationPresetState.status === 'unknown') {
      return;
    }

    Keyboard.dismiss();

    setIsAnalyzingPreset({
      ...translationPresetState.preset,
    });
    // @ts-ignore
    const payload: AnalyzePayload = {
      [translationPresetState.preset.isReverse ? 'target' : 'source']:
        lookUpText,
      sourceLanguage: translationPresetState.preset
        .sourceLanguage as GoogleLanguage,
      targetLanguage: translationPresetState.preset
        .translationLanguage as GoogleLanguage,
    };

    abortControllerRef.current = new AbortController();
    const lookupResult = await analyze(payload, abortControllerRef.current);

    if (
      lookupResult.success === false &&
      lookupResult.errorCode !== 'API_REQUEST_ABORTED'
    ) {
      Alert.alert(
        'Error: Look up failed',
        'Oops! Something went wrong while attempting to look up. Please try again later.'
      );
    }

    if (
      !lookupResult.success &&
      lookupResult.errorCode === 'API_REQUEST_ABORTED'
    ) {
      return;
    }

    setLookupResult(lookupResult);
    setIsAnalyzingPreset(false);

    posthog.capture('lookup', payload);
  };

  useEffect(() => {
    if (
      translationPresetState.status === 'known' &&
      translationPresetState.preset.sourceLanguage &&
      translationPresetState.preset.translationLanguage &&
      lookUpText
    ) {
      lookUp();
    }
  }, [
    // Translation preset state can be a new object,
    // but all we care about is sourceLanguage, targetLanguage, and if it is reversed
    translationPresetState.status === 'known'
      ? `${translationPresetState.preset.sourceLanguage}${translationPresetState.preset.translationLanguage}${translationPresetState.preset.isReverse}`
      : '',
  ]);

  const { onAdd, onRemove, onTagsChange } = useAnalyzeOperations({
    deck,
  });

  if (translationPresetState.status === 'unknown') {
    return <Loader>Loading translation preset...</Loader>;
  }

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
      }}
      behavior="padding"
    >
      <ScreenLayout
        header={
          <Surface
            elevation={1}
            style={{
              paddingTop: insets.top,
              paddingLeft: insets.left,
              paddingRight: insets.right,
              paddingBottom: 24,
            }}
          >
            {isSharedLookUp && (
              <View
                style={{
                  flexDirection: 'row',
                  paddingLeft: padding + 8,
                  paddingRight: padding - 8,
                  paddingTop: padding,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 18 }}>Vocably</Text>
                <Button
                  style={{ marginLeft: 'auto' }}
                  onPress={async () => {
                    exitSharedScreen();
                  }}
                >
                  Done
                </Button>
              </View>
            )}
            <View
              style={{
                padding: padding,
                width: '100%',
                paddingBottom: 12,
              }}
            >
              <TranslationPresetForm
                navigation={navigation}
                languagePairs={translationPresetState.languagePairs}
                preset={translationPresetState.preset}
                onChange={translationPresetState.setPreset}
              />
            </View>
            <View
              style={{
                paddingHorizontal: padding,
              }}
            >
              <SearchInput
                ref={searchInputRef}
                value={lookUpText}
                multiline={false}
                placeholder={'Any word in any language'}
                onChange={setLookUpText}
                onSubmit={lookUp}
                pasteFromClipboard={true}
                disabled={
                  !translationPresetState.preset.sourceLanguage ||
                  !translationPresetState.preset.translationLanguage
                }
              />
            </View>
          </Surface>
        }
        content={
          <ScrollView
            contentContainerStyle={{
              paddingBottom: insets.bottom + padding - 2,
            }}
          >
            {!isAnalyzingPreset && !lookUpResult && (
              <View
                style={{
                  width: '100%',
                  paddingTop: 24,
                  paddingHorizontal: 16,
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  flex: 1,
                }}
              >
                <View
                  style={{
                    gap: 12,
                    alignItems: 'stretch',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ textAlign: 'center' }}>
                    Want to generate a list of cards on a specific topic?
                  </Text>
                  <Button
                    icon={'plus-circle-multiple-outline'}
                    textColor={theme.colors.onBackground}
                    style={{
                      borderColor: theme.colors.onBackground,
                    }}
                    mode={'outlined'}
                    onPress={() => {
                      setGenerateIsOpened(true);
                      if (searchInputRef.current) {
                        searchInputRef.current.blur();
                      }
                      navigation.navigate('GenerateCards');
                    }}
                  >
                    Try the new AI card generator
                  </Button>
                  <Text style={{ textAlign: 'center', marginTop: 24 }}>
                    Questions or suggestions?
                  </Text>
                  <Button
                    textColor={theme.colors.onBackground}
                    style={{
                      borderColor: theme.colors.onBackground,
                    }}
                    icon={({ size, color }) => (
                      <Icon name="telegram" size={size} color={color} />
                    )}
                    mode={'outlined'}
                    onPress={() => Linking.openURL('https://t.me/vocably')}
                  >
                    Connect on Telegram
                  </Button>

                  <Button
                    textColor={theme.colors.onBackground}
                    style={{
                      borderColor: theme.colors.onBackground,
                    }}
                    icon={({ size, color }) => (
                      <Icon name="discord" size={size} color={color} />
                    )}
                    mode={'outlined'}
                    onPress={() =>
                      Linking.openURL('https://discord.gg/9aRwbJ3qeh')
                    }
                  >
                    Join Discord
                  </Button>

                  <Button
                    textColor={theme.colors.onBackground}
                    style={{
                      borderColor: theme.colors.onBackground,
                    }}
                    icon={'message-text-outline'}
                    mode={'outlined'}
                    onPress={() => navigation.navigate('Feedback')}
                  >
                    Send a message
                  </Button>
                </View>
              </View>
            )}
            {isAnalyzingPreset && (
              <Animated.View
                entering={FadeIn}
                exiting={FadeOut.duration(50)}
                style={{
                  padding: padding + 8,
                  paddingTop: mainPadding + 4,
                }}
              >
                <CardSkeletonLoader />
              </Animated.View>
            )}
            {!isAnalyzingPreset && lookUpResult && lookUpResult.success && (
              <AnalyzeResult
                cardsLimit={cardsLimit}
                leftInset={insets.left}
                rightInset={insets.right}
                style={{
                  flex: 1,
                  width: '100%',
                  marginRight: 8,
                }}
                analysis={lookUpResult.value}
                cards={deck.deck.cards}
                onAdd={(card) => {
                  posthog.capture('mobileCardAdded', {
                    card: card.card,
                  });
                  return onAdd(card);
                }}
                onRemove={onRemove}
                onTagsChange={onTagsChange}
                deck={deck}
                isSharedLookup={isSharedLookUp}
              />
            )}
          </ScrollView>
        }
      />
    </KeyboardAvoidingView>
  );
};
