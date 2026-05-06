import { NavigationProp, Route } from '@react-navigation/native';
import { ChatCard, ChatWithCardMessage } from '@vocably/model';
import { last } from 'lodash-es';
import { usePostHog } from 'posthog-react-native';
import React, { FC, useEffect, useRef, useState } from 'react';
import { Platform, ScrollView, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { Button, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { chatWithCard } from '../api';
import { ChatTextInput } from '../Chat/ChatTextInput';
import { Message } from '../Chat/Message';
import { Thinking } from '../Chat/Thinking';
import { ScreenLayout } from '../ui/ScreenLayout';
import { getInitialMessage } from './getInitialMessage';

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
  const theme = useTheme();
  const posthog = usePostHog();

  useEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: theme.colors.elevation.level1,
      },
    });
  }, []);

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

  const messageWrapperStyle = {
    marginBottom: 8,
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
            contentContainerStyle={{
              marginTop: 16,
              marginBottom: 8,
              marginLeft: insets.left + 16,
              marginRight: insets.right + 16,
              flexGrow: 1,
            }}
            ref={scrollViewRef}
          >
            <Message
              direction="fromAi"
              message={getInitialMessage(card)}
              style={messageWrapperStyle}
            />
            {messages.map((message) => (
              <Message
                key={message.timestamp}
                message={message.message}
                direction={message.role === 'assistant' ? 'fromAi' : 'toAi'}
                style={messageWrapperStyle}
              />
            ))}
            {isThinking && <Thinking style={messageWrapperStyle} />}
            {lastMessageError && (
              <Message
                direction="fromAi"
                message={lastMessageError}
                error={true}
                style={messageWrapperStyle}
              />
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
              backgroundColor: theme.colors.elevation.level1,
              borderTopWidth: 0.5,
              borderTopColor: theme.colors.elevation.level5,
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
                textColor={theme.colors.onSurface}
                style={{
                  borderColor: isThinking
                    ? theme.colors.surfaceDisabled
                    : theme.colors.onSurface,
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
                textColor={theme.colors.onSurface}
                style={{
                  borderColor: isThinking
                    ? theme.colors.surfaceDisabled
                    : theme.colors.onSurface,
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
                textColor={theme.colors.onSurface}
                style={{
                  borderColor: isThinking
                    ? theme.colors.surfaceDisabled
                    : theme.colors.onSurface,
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
              autoFocus={true}
            />
          </View>
        }
      />
    </KeyboardAvoidingView>
  );
};
