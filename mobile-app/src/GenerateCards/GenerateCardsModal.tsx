import { NavigationProp, Route } from '@react-navigation/native';
import React, { FC, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Surface, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChatTextInput } from '../Chat/ChatTextInput';
import { Message } from '../Chat/Message';
import { Loader } from '../loaders/Loader';
import { useTranslationPreset } from '../TranslationPreset/useTranslationPreset';
import { ScreenLayout } from '../ui/ScreenLayout';
import { GenerateTranslationPresetForm } from './GenerateTranslationPresetForm';

type Props = {
  route: Route<string, any>;
  navigation: NavigationProp<any>;
};

const padding = 16;

const initialMessage = `What cards would you like to generate?
Try some examples:

* irregular verbs
* body parts
* animals
* idioms`;

export const GenerateCardsModal: FC<Props> = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const translationPresetState = useTranslationPreset();
  const theme = useTheme();
  const [message, setMessage] = useState('');

  if (translationPresetState.status === 'unknown') {
    return <Loader>Loading translation preset...</Loader>;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScreenLayout
        content={
          <View
            style={{
              flex: 1,
              marginTop: insets.top + padding,
              marginBottom: 8,
              marginLeft: insets.left + padding,
              marginRight: insets.right + padding,
              borderRadius: 16,
              overflow: 'hidden',
            }}
          >
            <ScrollView
              contentContainerStyle={{
                flexGrow: 1,
              }}
            >
              <TouchableWithoutFeedback
                onPress={Keyboard.dismiss}
                accessible={false}
              >
                <Message direction="fromAi" message={initialMessage} />
              </TouchableWithoutFeedback>
            </ScrollView>
          </View>
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
              value={message}
              onChange={setMessage}
              placeholder="What would you like to generate?"
              onSubmit={() => {}}
            />
          </Surface>
        }
      />
    </KeyboardAvoidingView>
  );
};
