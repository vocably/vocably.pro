import { NavigationProp, Route } from '@react-navigation/native';
import { chatWithCard } from '@vocably/api';
import { ChatCard, ChatWithCardMessage } from '@vocably/model';
import { last } from 'lodash-es';
import { usePostHog } from 'posthog-react-native';
import React, { FC, useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenLayout } from '../ui/ScreenLayout';
import { ChatTextInput, ChatTextInputRef } from './ChatTextInput';
import { getInitialMessage } from './getInitialMessage';
import { Message } from './Message';
import { Thinking } from './Thinking';

export type ChatWithCardParams = {
  card: ChatCard;
};

type Props = {
  route: Route<string, any>;
  navigation: NavigationProp<any>;
};

export const ChatWithCardModal: FC<Props> = ({ route, navigation }) => {
  const { card } = route.params as ChatWithCardParams;
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatWithCardMessage[]>([]);
  const [lastMessageError, setLastMessageError] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const inputRef = useRef<ChatTextInputRef>(null);
  const theme = useTheme();
  const posthog = usePostHog();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }
    }, 200);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    posthog.capture('chat-with-card-modal-opened', {
      card,
    });
  }, []);

  const send = async (message?: string) => {
    setLastMessageError(null);

    const newMessages: ChatWithCardMessage[] = [
      ...messages,
      {
        timestamp: new Date().getTime(),
        role: 'user',
        message: message ?? inputValue,
      },
    ];
    setMessages(newMessages);

    posthog.capture('chat-with-card-message-sent', {
      card,
      messages: newMessages,
    });

    if (!message) {
      setInputValue('');
    }

    setIsThinking(true);

    const chatResult = await chatWithCard({
      card,
      history: newMessages,
    });

    posthog.capture('chat-with-card-message-result', {
      card,
      result: chatResult,
    });

    if (chatResult.success === true) {
      setMessages(chatResult.value.messages);
    } else {
      setLastMessageError('An error occurred. Please try again.');
      const lastMessage = last(newMessages);
      lastMessage && setInputValue(lastMessage.message);
      setMessages(newMessages.slice(0, -1));
    }

    setIsThinking(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={30}
    >
      <ScreenLayout
        content={
          <View
            style={{
              flex: 1,
              marginTop: 16,
              marginBottom: 8,
              marginLeft: insets.left + 16,
              marginRight: insets.right + 16,
              borderRadius: 16,
              overflow: 'hidden',
            }}
          >
            <ScrollView
              contentContainerStyle={{
                flexGrow: 1,
                gap: 8,
              }}
              ref={scrollViewRef}
            >
              <Message direction="fromAi" message={getInitialMessage(card)} />
              {messages.map((message) => (
                <Message
                  key={message.timestamp}
                  message={message.message}
                  direction={message.role === 'assistant' ? 'fromAi' : 'toAi'}
                />
              ))}
              {isThinking && <Thinking />}
              {lastMessageError && (
                <Message
                  direction="fromAi"
                  message={lastMessageError}
                  error={true}
                />
              )}
            </ScrollView>
          </View>
        }
        footer={
          <View
            style={{
              paddingBottom: insets.bottom + 16,
              paddingLeft: insets.left + 16,
              paddingRight: insets.right + 16,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                gap: 4,
                marginBottom: 8,
              }}
            >
              <Button
                mode="outlined"
                compact={true}
                textColor={theme.colors.outlineVariant}
                style={{
                  borderColor: isThinking
                    ? theme.colors.surfaceDisabled
                    : theme.colors.outlineVariant,
                }}
                labelStyle={{
                  marginHorizontal: 8,
                  marginVertical: 4,
                }}
                disabled={isThinking}
                onPress={() => {
                  send('Explain');
                }}
              >
                Explain
              </Button>
              <Button
                mode="outlined"
                compact={true}
                textColor={theme.colors.outlineVariant}
                style={{
                  borderColor: isThinking
                    ? theme.colors.surfaceDisabled
                    : theme.colors.outlineVariant,
                }}
                labelStyle={{
                  marginHorizontal: 8,
                  marginVertical: 4,
                }}
                disabled={isThinking}
                onPress={() => {
                  send('Provide several example sentences');
                }}
              >
                Examples
              </Button>
              <Button
                mode="outlined"
                compact={true}
                textColor={theme.colors.outlineVariant}
                style={{
                  borderColor: isThinking
                    ? theme.colors.surfaceDisabled
                    : theme.colors.outlineVariant,
                }}
                labelStyle={{
                  marginHorizontal: 8,
                  marginVertical: 4,
                }}
                disabled={isThinking}
                onPress={() => {
                  send('Help me to remember this card');
                }}
              >
                Remember
              </Button>
            </View>
            <ChatTextInput
              ref={inputRef}
              disabled={isThinking}
              value={inputValue}
              placeholder={
                isThinking
                  ? 'This input is disabled now.'
                  : 'Type your message here...'
              }
              multiline={true}
              onChange={setInputValue}
              onSubmit={() => send()}
            />
          </View>
        }
      />
    </KeyboardAvoidingView>
  );
};
