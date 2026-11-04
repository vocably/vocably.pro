import { NavigationProp } from '@react-navigation/native';
import {
  AnalyzePayload,
  GoogleLanguage,
  isDirectAnalyzePayload,
  UnitOfSpeech,
} from '@vocably/model';
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
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { Collapsible } from './ui/Collapsible';
import { CustomSurface } from './ui/CustomSurface';
import { Divider } from './ui/Divider';
import { ListItem } from './ui/ListItem';
import { ScreenLayout } from './ui/ScreenLayout';
import { useAnalyzeOperations } from './useAnalyzeOperations';
import { useCardsLimit } from './useCardsLimit';
import { publicExplain } from '@vocably/api';
import { createExplainPayload } from '@vocably/model-operations';
import UnitsOfSpeechAnalyze from './GenerateCards/UnitsOfSpeechAnalyze';
import { Thinking } from './Chat/Thinking';
import { TranslationPresetFormCompact } from './TranslationPresetFormCompact';
import { HelloMessage } from './LookUpScreen/HelloMessage';
import {
  consumeLookUpFocusRequest,
  onLookUpFocusRequest,
} from './LookUpScreen/lookUpFocusRequest';
import { SearchHint } from './LookUpScreen/SearchHint';
import { useLookUpCount } from './LookUpScreen/useLookUpCount';
import { getHistoryItemText, useHistory } from './LookUpScreen/useHistory';
import { LookUpHistory } from './LookUpScreen/LookUpHistory';
import { SentenceExplanation } from './LookUpScreen/SentenceExplanation';

const padding = 16;

// The search hint disappears once the user has made this many look ups.
const searchHintLookUpLimit = 10;

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
        explanation: string;
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

  const sectionTitleStyle = {
    color: theme.colors.onSurfaceVariant,
    paddingHorizontal: 16,
    marginBottom: 8,
  };

  const cardsLimit = useCardsLimit();

  const posthog = usePostHog();

  const lookUpCount = useLookUpCount();

  const isHistoryEnabled = !isSharedLookUp && !isModal;
  const { history, addHistoryItem, removeHistoryItem } = useHistory();

  const cancelThePreviousLookUp = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
    }

    setIsAnalyzingPreset(false);
    setExplainStatus({ status: 'empty' });
  };

  const searchInputRef = useRef<SearchInputRef>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (isModal || isSharedLookUp) {
      return;
    }

    const focusIfRequested = () => {
      if (navigation.isFocused() && consumeLookUpFocusRequest()) {
        searchInputRef.current?.focus();
      }
    };

    const unsubscribeFocus = navigation.addListener('focus', focusIfRequested);
    const unsubscribeRequest = onLookUpFocusRequest(focusIfRequested);

    return () => {
      unsubscribeFocus();
      unsubscribeRequest();
    };
  }, [navigation, isModal, isSharedLookUp]);

  useEffect(() => {
    if (lookUpText === '') {
      cancelThePreviousLookUp();
      setLookupResult(undefined);
      setExplainStatus({ status: 'empty' });
    }
  }, [lookUpText]);

  const abortControllerRef = useRef<AbortController | null>(null);

  const [showHelloMessage, setShowHelloMessage] = useState(false);

  const lookUp = async (
    text: string = lookUpText,
    {
      isDirect = false,
      payload: payloadOverride,
    }: { isDirect?: boolean; payload?: AnalyzePayload } = {}
  ) => {
    cancelThePreviousLookUp();

    if (!text) {
      return;
    }

    if (translationPresetState.status === 'unknown') {
      return;
    }

    if (hello.includes(text.toLowerCase())) {
      posthog.capture('greetingShowedUp');
      setShowHelloMessage(true);
    }

    Keyboard.dismiss();

    setExplainStatus({ status: 'empty' });
    setIsAnalyzingPreset({
      ...translationPresetState.preset,
    });
    // @ts-ignore
    const payload: AnalyzePayload = payloadOverride ?? {
      [translationPresetState.preset.isReverse && !isModal && !isDirect
        ? 'target'
        : 'source']: text,
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

    if (lookupResult.success) {
      lookUpCount.increment();

      if (isHistoryEnabled) {
        addHistoryItem(payload);
      }
    }

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

    const explanation = (explainResult.value.explanation ?? '').trim();
    // Single-word look ups come without units of speech
    const unitsOfSpeech = explainResult.value.unitsOfSpeech ?? [];

    if (explanation || unitsOfSpeech.length > 0) {
      setExplainStatus({
        status: 'loaded',
        value: {
          explanation,
          unitsOfSpeech,
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

  const lookUpHistoryItem = (item: AnalyzePayload) => {
    if (translationPresetState.status !== 'known') {
      return;
    }

    const text = getHistoryItemText(item);
    setLookUpText(text);

    const preset: Preset = {
      sourceLanguage: item.sourceLanguage,
      translationLanguage: item.targetLanguage,
      isReverse: !isDirectAnalyzePayload(item),
    };
    const currentPreset = translationPresetState.preset;

    if (
      preset.sourceLanguage === currentPreset.sourceLanguage &&
      preset.translationLanguage === currentPreset.translationLanguage &&
      preset.isReverse === currentPreset.isReverse
    ) {
      lookUp(text, { payload: item });
      return;
    }

    // The preset change triggers the look up (see the effect above)
    translationPresetState.setPreset(preset);
  };

  const lookUpExampleWord = (word: string) => {
    setLookUpText(word);
    // Example words are always looked up as a direct translation,
    // regardless of the preset direction
    lookUp(word, { isDirect: true });
  };

  if (translationPresetState.status === 'unknown') {
    return <Loader>{t('lookUp.loadingPreset')}</Loader>;
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
          <CustomSurface
            elevation={1}
            style={{
              paddingTop: !isModal ? insets.top : 0,
              paddingLeft: insets.left,
              paddingRight: insets.right,
              paddingBottom: 24,
              backgroundColor: theme.colors.elevation.level1,
              borderRadius: 0,
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
                  testID="lookup-share-close"
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
                    testID="lookup-close"
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
                onClear={() =>
                  scrollViewRef.current?.scrollTo({ y: 0, animated: false })
                }
                pasteFromClipboard={true}
                disabled={
                  !translationPresetState.preset.sourceLanguage ||
                  !translationPresetState.preset.translationLanguage
                }
              />
              <Collapsible
                visible={
                  !isSharedLookUp &&
                  lookUpText === '' &&
                  lookUpCount.count !== undefined &&
                  lookUpCount.count < searchHintLookUpLimit
                }
              >
                <SearchHint
                  style={{ marginTop: 12, marginLeft: 8 }}
                  sourceLanguage={translationPresetState.preset.sourceLanguage}
                  targetLanguage={
                    translationPresetState.preset.translationLanguage
                  }
                  onPress={lookUpExampleWord}
                />
              </Collapsible>
            </View>
          </CustomSurface>
        }
        content={
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={{
              paddingBottom: insets.bottom + padding - 2,
            }}
          >
            {showHelloMessage && (
              <HelloMessage
                language={translationPresetState.preset.translationLanguage}
                leftInset={insets.left}
                rightInset={insets.right}
                onGenerateCards={() => {
                  if (searchInputRef.current) {
                    searchInputRef.current.blur();
                  }
                  navigation.navigate('GenerateCards');
                }}
                onClose={() => setShowHelloMessage(false)}
              />
            )}
            {!isAnalyzingPreset && !lookUpResult && !isSharedLookUp && (
              <View
                style={{
                  width: '100%',
                  paddingTop: 24,
                  paddingLeft: insets.left + padding,
                  paddingRight: insets.right + padding,
                  gap: 32,
                }}
              >
                {isHistoryEnabled && (
                  <LookUpHistory
                    history={history}
                    deleteHistoryItem={removeHistoryItem}
                    onSelect={lookUpHistoryItem}
                  />
                )}
                {isHistoryEnabled &&
                  history.status === 'loaded' &&
                  history.history.length === 0 && (
                    <View>
                      <Text variant="labelLarge" style={sectionTitleStyle}>
                        {t('lookUp.lookingForCollections')}
                      </Text>
                      <CustomSurface>
                        <ListItem
                          testID="lookup-try-ai-generator"
                          leftIcon="palette-swatch-outline"
                          title={t('lookUp.tryAiGenerator')}
                          rightIcon=""
                          onPress={() => {
                            if (searchInputRef.current) {
                              searchInputRef.current.blur();
                            }
                            navigation.navigate('GenerateCards');
                          }}
                        />
                      </CustomSurface>
                    </View>
                  )}
                <View>
                  <Text variant="labelLarge" style={sectionTitleStyle}>
                    {t('lookUp.questionsOrSuggestions')}
                  </Text>
                  <CustomSurface>
                    <ListItem
                      testID="lookup-telegram"
                      order="first"
                      leftIcon="telegram"
                      leftIconSet="material"
                      rightIcon=""
                      title={t('lookUp.connectOnTelegram')}
                      onPress={() => Linking.openURL('https://t.me/vocably')}
                    />
                    <Divider />
                    <ListItem
                      testID="lookup-discord"
                      order="middle"
                      leftIcon="discord"
                      leftIconSet="material"
                      rightIcon=""
                      title={t('lookUp.joinDiscord')}
                      onPress={() =>
                        Linking.openURL('https://discord.gg/9aRwbJ3qeh')
                      }
                    />
                    <Divider />
                    <ListItem
                      testID="lookup-send-message"
                      order="last"
                      leftIcon="message-text-outline"
                      rightIcon=""
                      title={t('lookUp.sendMessage')}
                      onPress={() => navigation.navigate('Feedback')}
                    />
                  </CustomSurface>
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
                  requestFeedback={true}
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
                    {explainStatus.value.explanation !== '' && (
                      <Animated.View
                        entering={FadeIn}
                        style={{
                          paddingLeft: insets.left + padding + 8,
                          paddingRight: insets.right + padding + 8,
                          paddingTop: 8,
                          paddingBottom: 16,
                        }}
                      >
                        <SentenceExplanation
                          explanation={explainStatus.value.explanation}
                        />
                      </Animated.View>
                    )}
                    {explainStatus.value.unitsOfSpeech.length > 0 && (
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
                        // The explanation box already separates the cards from the result above
                        alwaysShowSeparator={
                          explainStatus.value.explanation === ''
                        }
                        leftInset={insets.left}
                        rightInset={insets.right}
                        cardsLimit={cardsLimit}
                        requestFeedback={true}
                      />
                    )}
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
