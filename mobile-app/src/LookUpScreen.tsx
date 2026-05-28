import { NavigationProp } from '@react-navigation/native';
import { AnalyzePayload, GoogleLanguage, UnitOfSpeech } from '@vocably/model';
import { usePostHog } from 'posthog-react-native';
import React, { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Keyboard, Linking, ScrollView, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import {
  Button,
  IconButton,
  Surface,
  Text,
  useTheme,
} from 'react-native-paper';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInUp,
  SlideOutUp,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { analyze } from './api';
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
import { publicExplain } from '@vocably/api';
import { createExplainPayload } from '@vocably/model-operations';
import UnitsOfSpeechAnalyze from './GenerateCards/UnitsOfSpeechAnalyze';
import { Thinking } from './Chat/Thinking';
import { TranslationPresetFormCompact } from './TranslationPresetFormCompact';
import Markdown from 'react-native-markdown-display';
import { greeting } from './LookUpScreen/greeting';

const padding = 16;

const hello = [
  'hello',
  'hi',
  'hey',
  'hola',
  'halo',
  'aloha',
  'bonjour',
  'ciao',
  'salut',
  'oi',
  'привет',
  'nihao',
];

type ExplainStatus =
  | {
      status: 'loading';
    }
  | {
      status: 'loaded';
      value: {
        unitsOfSpeech: UnitOfSpeech[];
      };
    }
  | {
      status: 'empty';
    };

type Props = {
  navigation: NavigationProp<any>;
  initialText?: string;
  isSharedLookUp?: boolean;
  isModal?: boolean;
};

export const LookUpScreen: FC<Props> = ({
  navigation,
  initialText = '',
  isSharedLookUp = false,
  isModal = false,
}) => {
  const translationPresetState = useTranslationPreset();
  const { t } = useTranslation();
  const [lookUpText, setLookUpText] = useState(initialText);
  const [noFocusOnReturn, setNoFocusOnReturn] = useState(false);
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

  const [explainStatus, setExplainStatus] = useState<ExplainStatus>({
    status: 'empty',
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
    setExplainStatus({ status: 'empty' });
  };

  const searchInputRef = useRef<SearchInputRef>(null);

  useEffect(() => {
    return navigation.addListener('focus', () => {
      if (searchInputRef.current && !noFocusOnReturn && !isModal) {
        searchInputRef.current.focus();
      }

      setNoFocusOnReturn(false);
    });
  }, [noFocusOnReturn]);

  useEffect(() => {
    if (lookUpText === '') {
      cancelThePreviousLookUp();
      setLookupResult(undefined);
      setExplainStatus({ status: 'empty' });
    }
  }, [lookUpText]);

  const abortControllerRef = useRef<AbortController | null>(null);

  const [showHelloMessage, setShowHelloMessage] = useState(false);

  const lookUp = async () => {
    cancelThePreviousLookUp();

    if (!lookUpText) {
      return;
    }

    if (translationPresetState.status === 'unknown') {
      return;
    }

    if (hello.includes(lookUpText.toLowerCase())) {
      posthog.capture('greetingShowedUp');
      setShowHelloMessage(true);
    }

    Keyboard.dismiss();

    setExplainStatus({ status: 'empty' });
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
        t('lookUp.lookUpFailedTitle'),
        t('lookUp.lookUpFailedMessage')
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

    // Explain

    if (!lookupResult.success) {
      return;
    }

    const explainPayload = createExplainPayload(lookupResult.value);

    if (!explainPayload) {
      return;
    }

    setExplainStatus({
      status: 'loading',
    });

    const explainResult = await publicExplain(
      explainPayload,
      abortControllerRef.current
    );

    setExplainStatus({ status: 'empty' });

    if (!explainResult.success) {
      return;
    }

    if (explainResult.value.unitsOfSpeech.length > 0) {
      setExplainStatus({
        status: 'loaded',
        value: {
          unitsOfSpeech: explainResult.value.unitsOfSpeech,
        },
      });
    }
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
    return <Loader>{t('lookUp.loadingPreset')}</Loader>;
  }

  const onLookUpModalOpen = () => {
    setNoFocusOnReturn(true);
  };

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
              paddingTop: !isModal ? insets.top : 0,
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
                  {t('common.done')}
                </Button>
              </View>
            )}
            <View
              style={{
                padding: padding,
                paddingVertical: 4,
                width: '100%',
                paddingBottom: 12,
              }}
            >
              {!isModal && (
                <TranslationPresetForm
                  navigation={navigation}
                  languagePairs={translationPresetState.languagePairs}
                  preset={translationPresetState.preset}
                  onChange={translationPresetState.setPreset}
                />
              )}

              {isModal && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <IconButton
                    icon="close"
                    onPress={() => {
                      navigation.goBack();
                    }}
                    style={{ backgroundColor: 'transparent', marginLeft: -6 }}
                  />
                  <TranslationPresetFormCompact
                    navigation={navigation}
                    languagePairs={translationPresetState.languagePairs}
                    preset={translationPresetState.preset}
                    onChange={translationPresetState.setPreset}
                  />
                </View>
              )}
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
                placeholder={t('lookUp.searchPlaceholder')}
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
            {showHelloMessage && (
              <Animated.View
                entering={SlideInUp.duration(300)}
                exiting={SlideOutUp.duration(300)}
                style={{
                  width: '100%',
                  alignItems: 'stretch',
                  flex: 1,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    paddingLeft: insets.left + padding,
                    paddingRight: insets.right + padding,
                    paddingVertical: padding,
                    position: 'relative',
                  }}
                >
                  <View
                    style={{
                      backgroundColor: theme.colors.elevation.level2,
                      padding: 16,
                      borderRadius: 8,
                      gap: 8,
                    }}
                  >
                    <Markdown
                      style={{
                        body: {
                          color: theme.colors.onBackground,
                        },
                      }}
                    >
                      {greeting[
                        translationPresetState.preset
                          .translationLanguage as GoogleLanguage
                      ]?.body ?? greeting['en']?.body}
                    </Markdown>

                    <Button
                      icon={'robot-outline'}
                      textColor={theme.colors.onBackground}
                      style={{
                        borderColor: theme.colors.onBackground,
                      }}
                      mode={'outlined'}
                      onPress={() => {
                        setNoFocusOnReturn(true);
                        if (searchInputRef.current) {
                          searchInputRef.current.blur();
                        }
                        navigation.navigate('GenerateCards');
                      }}
                    >
                      {greeting[
                        translationPresetState.preset
                          .translationLanguage as GoogleLanguage
                      ]?.button ?? greeting['en']?.button}
                    </Button>
                  </View>

                  <IconButton
                    icon={'close'}
                    style={{
                      position: 'absolute',
                      right: padding + 8,
                      top: padding + 12,
                    }}
                    size={16}
                    onPress={() => setShowHelloMessage(false)}
                  />
                </View>
              </Animated.View>
            )}
            {!isAnalyzingPreset && !lookUpResult && !isSharedLookUp && (
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
                    width: '90%',
                  }}
                >
                  <Text style={{ textAlign: 'center' }}>
                    {t('lookUp.lookingForCollections')}
                  </Text>
                  <Button
                    icon={'robot-outline'}
                    textColor={theme.colors.onBackground}
                    style={{
                      borderColor: theme.colors.onBackground,
                    }}
                    mode={'outlined'}
                    onPress={() => {
                      setNoFocusOnReturn(true);
                      if (searchInputRef.current) {
                        searchInputRef.current.blur();
                      }
                      navigation.navigate('GenerateCards');
                    }}
                  >
                    {t('lookUp.tryAiGenerator')}
                  </Button>
                  <Text style={{ textAlign: 'center', marginTop: 24 }}>
                    {t('lookUp.questionsOrSuggestions')}
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
                    {t('lookUp.connectOnTelegram')}
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
                    {t('lookUp.joinDiscord')}
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
                    {t('lookUp.sendMessage')}
                  </Button>
                </View>
              </View>
            )}
            {isAnalyzingPreset && (
              <Animated.View
                entering={FadeIn}
                exiting={FadeOut.duration(50)}
                style={{
                  paddingLeft: insets.left + padding + 8,
                  paddingRight: insets.right + padding + 8,
                  paddingTop: mainPadding + 4,
                }}
              >
                <CardSkeletonLoader />
              </Animated.View>
            )}
            {!isAnalyzingPreset && lookUpResult && lookUpResult.success && (
              <>
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
                    posthog.capture('mobileCardAdded', card.card);
                    return onAdd(card);
                  }}
                  onRemove={onRemove}
                  onTagsChange={onTagsChange}
                  deck={deck}
                  isSharedLookup={isSharedLookUp}
                  onLookUpModalOpen={onLookUpModalOpen}
                />
                {explainStatus.status === 'loading' && (
                  <View
                    style={{
                      paddingLeft: insets.left + padding + 8,
                      paddingRight: insets.right + padding + 8,
                    }}
                  >
                    <Thinking message={t('lookUp.conductingAnalysis')} />
                  </View>
                )}
                {explainStatus.status === 'loaded' && (
                  <>
                    <UnitsOfSpeechAnalyze
                      sourceLanguage={lookUpResult.value.sourceLanguage}
                      targetLanguage={lookUpResult.value.targetLanguage}
                      unitsOfSpeech={explainStatus.value.unitsOfSpeech}
                      cards={deck.deck.cards}
                      deck={deck}
                      onRemove={onRemove}
                      onAdd={(card) => {
                        posthog.capture('generator-add', card.card);
                        return onAdd(card);
                      }}
                      onTagsChange={onTagsChange}
                      wrapperStyle={{
                        paddingLeft: insets.left + padding + 8,
                        paddingRight: insets.right + padding + 8,
                      }}
                      alwaysShowSeparator={true}
                      leftInset={insets.left}
                      rightInset={insets.right}
                      cardsLimit={cardsLimit}
                    />
                  </>
                )}
              </>
            )}
          </ScrollView>
        }
      />
    </KeyboardAvoidingView>
  );
};
