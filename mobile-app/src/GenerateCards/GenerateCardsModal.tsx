import { NavigationProp, Route } from '@react-navigation/native';
import {
  GoogleLanguage,
  isGoogleLanguage,
  UnitOfSpeechGenerationMessage,
} from '@vocably/model';
import { last } from 'lodash-es';
import { usePostHog } from 'posthog-react-native';
import React, { FC, useEffect, useRef, useState } from 'react';
import { Platform, ScrollView, Text, View } from 'react-native';
import {
  KeyboardAvoidingView,
  KeyboardAwareScrollView,
} from 'react-native-keyboard-controller';
import { Appbar, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { generateUnitsOfSpeech } from '../api';
import { ChatTextInput } from '../Chat/ChatTextInput';
import { Message } from '../Chat/Message';
import { Thinking } from '../Chat/Thinking';
import { useLanguageDeck } from '../languageDeck/useLanguageDeck';
import { Loader } from '../loaders/Loader';
import { useTranslationPreset } from '../TranslationPreset/useTranslationPreset';
import { ScreenLayout } from '../ui/ScreenLayout';
import { useAnalyzeOperations } from '../useAnalyzeOperations';
import { GenerateTranslationPresetForm } from './GenerateTranslationPresetForm';
import UnitsOfSpeechAnalyze from './UnitsOfSpeechAnalyze';
import { useCardsLimit } from '../useCardsLimit';

type Props = {
  route: Route<string, any>;
  navigation: NavigationProp<any>;
};

const padding = 16;

const languagesWithIrregularVerbs = [
  'pt-PT',
  'pt',
  'af',
  'nl',
  'da',
  'no',
  'it',
  'fr',
  'es',
  'de',
  'sv',
  'en',
  'en-GB',
];

export const GenerateCardsModal: FC<Props> = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const translationPresetState = useTranslationPreset();
  const theme = useTheme();
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const posthog = usePostHog();
  const cardsLimit = useCardsLimit();

  const deck = useLanguageDeck({
    language:
      translationPresetState.status === 'known'
        ? translationPresetState.preset.sourceLanguage
        : '',
    autoReload: true,
  });

  const { onAdd, onRemove, onTagsChange } = useAnalyzeOperations({
    deck,
  });

  const [lastMessageError, setLastMessageError] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [messages, setMessages] = useState<UnitOfSpeechGenerationMessage[]>([]);

  useEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: theme.colors.elevation.level1,
      },
      headerRight: () => (
        <Appbar.Action
          icon={'trash-can-outline'}
          onPress={() => {
            setMessages([]);
            posthog.capture('generator-refresh');
          }}
        />
      ),
    });
  }, []);

  const send = async (message: string) => {
    if (!message) {
      return;
    }

    if (isThinking) {
      return;
    }

    if (translationPresetState.status !== 'known') {
      return;
    }

    const sourceLanguage = translationPresetState.preset.sourceLanguage;

    if (!isGoogleLanguage(sourceLanguage)) {
      return;
    }

    const targetLanguage = translationPresetState.preset.translationLanguage;

    if (!isGoogleLanguage(targetLanguage)) {
      return;
    }

    posthog.capture('generator-message', {
      sourceLanguage,
      targetLanguage,
      message,
    });

    setLastMessageError(null);

    const newMessages: UnitOfSpeechGenerationMessage[] = [
      ...messages,
      {
        role: 'user',
        text: message,
      },
    ];
    setMessages(newMessages);

    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }
    }, 200);

    setInputText('');
    setIsThinking(true);

    const generateUnitsOfSpeechResult = await generateUnitsOfSpeech({
      sourceLanguage: sourceLanguage,
      messages: newMessages,
    });

    if (generateUnitsOfSpeechResult.success === false) {
      setLastMessageError('Unable to generate cards. Please try again.');
      const lastMessage = last(newMessages);
      if (lastMessage?.role === 'assistant') {
        setIsThinking(false);
        return;
      }
      lastMessage && setInputText(lastMessage.text);
      setMessages(newMessages.slice(0, -1));
      setIsThinking(false);

      return;
    }

    setMessages([...newMessages, generateUnitsOfSpeechResult.value]);
    setIsThinking(false);

    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }
    }, 200);
  };

  const runExample = (message: string) => async () => {
    await send(message);
  };

  if (translationPresetState.status === 'unknown') {
    return <Loader>Loading translation preset...</Loader>;
  }

  const linkStyle = {
    color: theme.colors.primary,
  };

  const messageWrapperStyle = {
    paddingLeft: insets.left + padding,
    paddingRight: insets.left + padding,
    marginBottom: 8,
  };

  const infoTextStyle = {
    fontSize: 16,
    color: theme.colors.onBackground,
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'android' ? 64 : 94}
    >
      <ScreenLayout
        content={
          <ScrollView
            keyboardShouldPersistTaps={'handled'}
            contentContainerStyle={{
              flexGrow: 1,
              paddingTop: 16,
            }}
            ref={scrollViewRef}
          >
            <View style={messageWrapperStyle}>
              <View
                style={{
                  alignSelf: 'flex-start',
                  backgroundColor: theme.colors.elevation.level5,
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  gap: 8,
                }}
              >
                <Text style={infoTextStyle}>
                  Type what you need, and Vocably will generate cards for you.
                </Text>
                <Text style={infoTextStyle}>
                  This is an experimental feature.{' '}
                  <Text
                    style={linkStyle}
                    onPress={() => navigation.navigate('Feedback')}
                  >
                    Let me know
                  </Text>{' '}
                  if you find any bugs or have any suggestions.
                </Text>
                <Text style={infoTextStyle}>Some examples to try:</Text>

                <View style={{ gap: 4 }}>
                  {languagesWithIrregularVerbs.includes(
                    translationPresetState.preset.sourceLanguage
                  ) && (
                    <Text style={infoTextStyle}>
                      -{' '}
                      <Text
                        style={linkStyle}
                        onPress={runExample('irregular verbs')}
                      >
                        irregular verbs
                      </Text>
                    </Text>
                  )}
                  <Text style={infoTextStyle} onPress={runExample('animals')}>
                    - <Text style={linkStyle}>animals</Text>
                  </Text>
                  <Text
                    style={infoTextStyle}
                    onPress={runExample('popular idioms')}
                  >
                    - <Text style={linkStyle}>popular idioms</Text>
                  </Text>
                </View>
              </View>
            </View>
            {messages.map((message, index) => (
              <View key={index}>
                {message.role === 'user' && (
                  <View style={messageWrapperStyle}>
                    <Message direction="toAi" message={message.text} />
                  </View>
                )}
                {message.role === 'assistant' && (
                  <>
                    {message.text && (
                      <View style={messageWrapperStyle}>
                        <Message direction="fromAi" message={message.text} />
                      </View>
                    )}
                    {message.unitsOfSpeech.length > 0 && (
                      <UnitsOfSpeechAnalyze
                        cardsLimit={cardsLimit}
                        sourceLanguage={
                          translationPresetState.preset
                            .sourceLanguage as GoogleLanguage
                        }
                        targetLanguage={
                          translationPresetState.preset
                            .translationLanguage as GoogleLanguage
                        }
                        unitsOfSpeech={message.unitsOfSpeech}
                        cards={deck.deck.cards}
                        deck={deck}
                        onRemove={onRemove}
                        onAdd={(card) => {
                          posthog.capture('generator-add', card.card);
                          return onAdd(card);
                        }}
                        onTagsChange={onTagsChange}
                        wrapperStyle={messageWrapperStyle}
                        leftInset={insets.left}
                        rightInset={insets.right}
                      />
                    )}
                  </>
                )}
              </View>
            ))}
            {isThinking && (
              <View style={messageWrapperStyle}>
                <Thinking message={'Thinking...'} />
              </View>
            )}
            {lastMessageError && (
              <View style={messageWrapperStyle}>
                <Message
                  direction="fromAi"
                  message={lastMessageError}
                  error={true}
                />
              </View>
            )}
          </ScrollView>
        }
        footer={
          <View
            style={{
              paddingBottom: insets.bottom + 16,
              paddingLeft: insets.left + 16,
              paddingRight: insets.right + 16,
              paddingTop: 8,
              gap: 8,
              backgroundColor: theme.colors.elevation.level1,
              borderTopWidth: 0.5,
              borderTopColor: theme.colors.elevation.level5,
            }}
          >
            <GenerateTranslationPresetForm
              navigation={navigation}
              languagePairs={translationPresetState.languagePairs}
              preset={translationPresetState.preset}
              onChange={translationPresetState.setPreset}
            />
            <ChatTextInput
              value={inputText}
              onChange={setInputText}
              placeholder={messages.length === 0 ? 'Just anything...' : ''}
              onSubmit={send}
              disabled={isThinking}
              multiline={true}
              autoFocus={true}
            />
          </View>
        }
      />
    </KeyboardAvoidingView>
  );
};
