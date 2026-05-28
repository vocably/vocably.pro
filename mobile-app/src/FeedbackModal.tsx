import { NavigationProp, Route } from '@react-navigation/native';
import { sendPublicUserFeedback } from '@vocably/api';
import { FC, useContext, useEffect, useState } from 'react';
import { Alert, Platform, View } from 'react-native';
import { Trans, useTranslation } from 'react-i18next';
import { Button, Text } from 'react-native-paper';
import { useUserEmail } from './auth/useUserEmail';
import { useTranslationPreset } from './TranslationPreset/useTranslationPreset';
import { CustomScrollView } from './ui/CustomScrollView';
import { FormText } from './ui/FormText';
import { AuthContext } from './auth/AuthContainer';
import { isFunction, pickBy } from 'lodash-es';

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
  const { t } = useTranslation();

  const authContext = useContext(AuthContext);

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
        authContext: pickBy(authContext, (v) => !isFunction(v)),
      },
    });

    if (res.success === true) {
      const hasEmail = userEmail || containsEmail(text);
      Alert.alert(
        t('feedback.thanksTitle'),
        hasEmail ? t('feedback.thanksFollowUp') : '',
        [
          {
            text: t('common.goBack'),
            onPress: () => {
              setText('');
              navigation.goBack();
            },
          },
        ]
      );
    } else {
      Alert.alert(t('feedback.sendFailed'));
    }

    setIsSending(false);
  };

  const sendFeedback = async () => {
    if (!userEmail && !containsEmail(text)) {
      Alert.alert(t('feedback.noEmailTitle'), t('feedback.noEmailMessage'), [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('feedback.send'),
          style: 'default',
          onPress: () => reallySend(),
        },
      ]);
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
          {t('feedback.send')}
        </Button>
      ),
    });
  }, [text, sendFeedback, isSending, t]);

  return (
    <CustomScrollView automaticallyAdjustKeyboardInsets={true}>
      <View style={{ gap: 16, marginBottom: 16 }}>
        <Text>{t('feedback.intro')}</Text>
        {userEmail && (
          <>
            <Text>{t('feedback.personalReply')}</Text>
            <Text>
              <Trans
                i18nKey="feedback.willReplyTo"
                values={{ email: userEmail }}
                components={{ bold: <Text style={{ fontWeight: 'bold' }} /> }}
              />
              {userEmail.includes('privaterelay') && (
                <Text> {t('feedback.privateRelayNote')}</Text>
              )}
            </Text>
          </>
        )}
        {!userEmail && (
          <>
            <Text>{t('feedback.provideEmail')}</Text>
          </>
        )}
      </View>
      <FormText
        label={t('feedback.yourMessage')}
        multiline
        inputStyle={{ minHeight: 128 }}
        onChangeText={setText}
        value={text}
      />
    </CustomScrollView>
  );
};
