import { NavigationProp, Route } from '@react-navigation/native';
import { analyzeUnitsOfSpeech, generateUnitsOfSpeech } from '@vocably/api';
import {
  AnalysisItem,
  GoogleLanguage,
  isGoogleLanguage,
  UnitOfSpeechGenerationMessage,
} from '@vocably/model';
import { last } from 'lodash-es';
import React, { FC, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Surface, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChatTextInput } from '../Chat/ChatTextInput';
import { Message } from '../Chat/Message';
import { Thinking } from '../Chat/Thinking';
import { useLanguageDeck } from '../languageDeck/useLanguageDeck';
import { Loader } from '../loaders/Loader';
import { AnalyzeResult } from '../LookUpScreen/AnalyzeResult';
import { useTranslationPreset } from '../TranslationPreset/useTranslationPreset';
import { ScreenLayout } from '../ui/ScreenLayout';
import { useAnalyzeOperations } from '../useAnalyzeOperations';
import { GenerateTranslationPresetForm } from './GenerateTranslationPresetForm';

type Props = {
  route: Route<string, any>;
  navigation: NavigationProp<any>;
};

const padding = 16;

const styles = StyleSheet.create({
  infoText: {
    fontSize: 16,
  },
});

type ThinkingStage = 'generating-list' | 'creating-cards' | 'done';

type MessageUser = {
  role: 'user';
  message: string;
};

type MessageAssistant = {
  role: 'assistant';
  items: AnalysisItem[];
};

type GenerateCardsMessage = MessageUser | MessageAssistant;

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
  const [thinkingStage, setThinkingStage] = useState<ThinkingStage>('done');
  const [messages, setMessages] = useState<GenerateCardsMessage[]>([]);

  const send = async (message: string) => {
    if (!message) {
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

    setLastMessageError(null);

    const newMessages: GenerateCardsMessage[] = [
      ...messages,
      {
        role: 'user',
        message: message,
      },
    ];
    setMessages(newMessages);

    setInputText('');
    setThinkingStage('generating-list');

    const generateUnitsOfSpeechResult = await generateUnitsOfSpeech({
      sourceLanguage: sourceLanguage,
      messages: newMessages.map((message): UnitOfSpeechGenerationMessage => {
        if (message.role === 'user') {
          return {
            role: 'user',
            text: message.message,
          };
        } else {
          return {
            role: 'assistant',
            unitsOfSpeech: message.items.map((item) => ({
              headword: item.source,
              partOfSpeech: item.partOfSpeech ?? '',
            })),
          };
        }
      }),
    });

    if (generateUnitsOfSpeechResult.success === false) {
      setLastMessageError('Unable to generate cards. Please try again.');
      const lastMessage = last(newMessages);
      if (lastMessage?.role === 'assistant') {
        setThinkingStage('done');
        return;
      }
      lastMessage && setInputText(lastMessage.message);
      setMessages(newMessages.slice(0, -1));
      setThinkingStage('done');

      return;
    }

    console.log(generateUnitsOfSpeechResult.value.unitsOfSpeech);

    setThinkingStage('creating-cards');

    const analyzeUnitsOfSpeechResult = await analyzeUnitsOfSpeech({
      unitsOfSpeech: generateUnitsOfSpeechResult.value.unitsOfSpeech,
      sourceLanguage,
      targetLanguage,
    });

    console.log(analyzeUnitsOfSpeechResult);

    if (analyzeUnitsOfSpeechResult.success === false) {
      setLastMessageError('Unable to generate cards. Please try again.');
      const lastMessage = last(newMessages);
      if (lastMessage?.role === 'assistant') {
        setThinkingStage('done');
        return;
      }
      lastMessage && setInputText(lastMessage.message);
      setMessages(newMessages.slice(0, -1));
      setThinkingStage('done');

      return;
    }

    setMessages([
      ...newMessages,
      {
        role: 'assistant',
        items: analyzeUnitsOfSpeechResult.value.items,
      },
    ]);
    setThinkingStage('done');
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScreenLayout
        content={
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingTop: insets.top + padding,
            }}
          >
            <TouchableWithoutFeedback
              onPress={Keyboard.dismiss}
              accessible={false}
            >
              <View
                style={{
                  flex: 1,
                  gap: 8,
                }}
              >
                <View
                  style={{
                    alignSelf: 'flex-start',
                    backgroundColor: theme.colors.elevation.level5,
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                    marginTop: 24,
                    gap: 8,
                    marginLeft: insets.left + padding,
                    marginRight: insets.right + padding,
                  }}
                >
                  <Text style={styles.infoText}>
                    Welcome to the card generator. Type what you need, and
                    Vocably will generate cards for you.
                  </Text>
                  <Text style={styles.infoText}>
                    This is an experimental feature. It works pretty poorly, but
                    I'm improving it.{' '}
                    <Text
                      style={linkStyle}
                      onPress={() => navigation.navigate('Feedback')}
                    >
                      Let me know
                    </Text>{' '}
                    if you find any bugs or have any suggestions.
                  </Text>
                  <Text style={styles.infoText}>Some examples to try:</Text>

                  {languagesWithIrregularVerbs.includes(
                    translationPresetState.preset.sourceLanguage
                  ) && (
                    <Text style={styles.infoText}>
                      -{' '}
                      <Text
                        style={linkStyle}
                        onPress={runExample('irregular verbs')}
                      >
                        irregular verbs
                      </Text>
                    </Text>
                  )}
                  <Text style={styles.infoText} onPress={runExample('animals')}>
                    - <Text style={linkStyle}>animals</Text>
                  </Text>
                  <Text
                    style={styles.infoText}
                    onPress={runExample('popular idioms')}
                  >
                    - <Text style={linkStyle}>popular idioms</Text>
                  </Text>
                </View>
                {messages.map((message, index) => (
                  <View key={index}>
                    {message.role === 'user' && (
                      <View
                        style={{
                          paddingLeft: insets.left + padding,
                          paddingRight: insets.left + padding,
                        }}
                      >
                        <Message direction="toAi" message={message.message} />
                      </View>
                    )}
                    {message.role === 'assistant' && (
                      <AnalyzeResult
                        cardsLimit={'unlimited'}
                        leftInset={insets.left}
                        rightInset={insets.right}
                        style={{
                          flex: 1,
                          width: '100%',
                          marginRight: 8,
                        }}
                        analysis={{
                          // @ts-ignore
                          items: message.items,
                          sourceLanguage: translationPresetState.preset
                            .sourceLanguage as GoogleLanguage,
                          targetLanguage: translationPresetState.preset
                            .sourceLanguage as GoogleLanguage,
                          source: '',
                          translation: {
                            sourceLanguage: translationPresetState.preset
                              .sourceLanguage as GoogleLanguage,
                            targetLanguage: translationPresetState.preset
                              .sourceLanguage as GoogleLanguage,
                            source: '',
                            target: '',
                          },
                        }}
                        cards={deck.deck.cards}
                        onAdd={(card) => {
                          return onAdd(card);
                        }}
                        onRemove={onRemove}
                        onTagsChange={onTagsChange}
                        deck={deck}
                        isSharedLookup={false}
                      />
                    )}
                  </View>
                ))}
                {thinkingStage !== 'done' && (
                  <View
                    style={{
                      paddingLeft: insets.left + padding,
                      paddingRight: insets.left + padding,
                    }}
                  >
                    <Thinking
                      message={
                        thinkingStage === 'generating-list'
                          ? 'Generating the list of items...'
                          : 'Creating cards...'
                      }
                    />
                  </View>
                )}
              </View>
            </TouchableWithoutFeedback>
          </ScrollView>
        }
        footer={
          <Surface
            elevation={0}
            style={{
              paddingLeft: insets.left + padding,
              paddingRight: insets.right + padding,
              paddingTop: padding,
              paddingBottom: padding,
              gap: 8,
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
              placeholder="What would you like to generate?"
              onSubmit={send}
              disabled={thinkingStage !== 'done'}
              multiline={true}
            />
          </Surface>
        }
      />
    </KeyboardAvoidingView>
  );
};
