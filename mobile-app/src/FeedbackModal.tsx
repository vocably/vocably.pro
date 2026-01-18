import { NavigationProp, Route } from '@react-navigation/native';
import { sendUserFeedback } from '@vocably/api';
import { FC, useCallback, useEffect, useState } from 'react';
import { Alert, Platform, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { useUserEmail } from './auth/useUserEmail';
import { useTranslationPreset } from './TranslationPreset/useTranslationPreset';
import { CustomScrollView } from './ui/CustomScrollView';
import { FormText } from './ui/FormText';

type Props = {
  route: Route<string, any>;
  navigation: NavigationProp<any>;
};

export const FeedbackModal: FC<Props> = ({ navigation, route }) => {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const userEmail = useUserEmail();

  const translationPreset = useTranslationPreset();

  const theme = useTheme();

  const sendFeedback = useCallback(async () => {
    setIsSending(true);
    const res = await sendUserFeedback({
      feedback: text,
      metadata: {
        platform: 'mobile',
        os: Platform.OS,
        translationPreset,
        extraRouteParams: route.params,
      },
    });

    if (res.success === true) {
      Alert.alert(
        'Thank you for your feedback.',
        'I appreciate your input and will follow up with you via email shortly.',
        [
          {
            text: 'Go back',
            onPress: () => {
              setText('');
              navigation.goBack();
            },
          },
        ]
      );
    } else {
      Alert.alert('Something went wrong. Please try again later.');
    }

    setIsSending(false);
  }, [sendUserFeedback, text, setIsSending, Alert, navigation.goBack]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          disabled={text.trim().length === 0 || isSending}
          onPress={sendFeedback}
          loading={isSending}
          style={{ marginRight: 8 }}
        >
          Send
        </Button>
      ),
    });
  }, [text, sendFeedback, isSending]);

  return (
    <CustomScrollView automaticallyAdjustKeyboardInsets={true}>
      <View style={{ gap: 16, marginBottom: 16 }}>
        <Text>
          Missing any crucial features? Have questions or want to share your
          thoughts on Vocably? I'd love to hear from you!
        </Text>
        <Text>
          I personally respond to every user, usually within a couple of days.
        </Text>
        {userEmail && (
          <Text>
            I'll reply to you at your email address{' '}
            <Text style={{ fontWeight: 'bold' }}>{userEmail}</Text>.
            {userEmail.includes('privaterelay') && (
              <Text>
                {' '}
                It looks like you shared a private Apple email with me during
                registration, but no worries — it should work just fine.
              </Text>
            )}
          </Text>
        )}
      </View>
      <FormText
        label="Your message"
        multiline
        inputStyle={{ minHeight: 128 }}
        onChangeText={setText}
        value={text}
      />
    </CustomScrollView>
  );
};
