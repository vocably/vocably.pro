import { NavigationProp, Route } from '@react-navigation/native';
import { sendPublicUserFeedback } from '@vocably/api';
import { FC, useEffect, useState } from 'react';
import { Alert, Platform, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useUserEmail } from './auth/useUserEmail';
import { useTranslationPreset } from './TranslationPreset/useTranslationPreset';
import { CustomScrollView } from './ui/CustomScrollView';
import { FormText } from './ui/FormText';

type Props = {
  route: Route<string, any>;
  navigation: NavigationProp<any>;
};

const containsEmail = (text: string) => {
  return text.includes('@');
};

export const FeedbackModal: FC<Props> = ({ navigation, route }) => {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const userEmail = useUserEmail();

  const translationPreset = useTranslationPreset();

  const reallySend = async () => {
    setIsSending(true);
    const res = await sendPublicUserFeedback({
      feedback: text,
      metadata: {
        platform: 'mobile',
        os: Platform.OS,
        translationPreset,
        extraRouteParams: route.params,
        email: userEmail,
      },
    });

    if (res.success === true) {
      const hasEmail = userEmail || containsEmail(text);
      Alert.alert(
        'Thank you for your feedback.',
        hasEmail ? 'I will follow up with you via email shortly.' : '',
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
      Alert.alert(
        'Something went wrong. Your feedback has not been sent. Please try again or contact me via email at d@vocably.pro.'
      );
    }

    setIsSending(false);
  };

  const sendFeedback = async () => {
    if (!userEmail && !containsEmail(text)) {
      Alert.alert(
        'No email',
        'Please include an email address right in the message so I can get back to you with an answer.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Send',
            style: 'default',
            onPress: () => reallySend(),
          },
        ]
      );
    } else {
      await reallySend();
    }
  };

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
        <Text>Have questions or feature requests? Reach out anytime.</Text>
        {userEmail && (
          <>
            <Text>
              I handle every inquiry personally and will get back to your email
              within few days.
            </Text>
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
          </>
        )}
        {!userEmail && (
          <>
            <Text>
              Please provide your email address so I can send a personal reply
              to your feedback.
            </Text>
          </>
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
