import { useNavigation } from '@react-navigation/native';
import { usePostHog } from 'posthog-react-native';
import { FC, useContext } from 'react';
import { Linking, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Text, useTheme } from 'react-native-paper';
import {
  mobilePlatform,
  mobileStoreName,
  mobileStoreUrl,
} from './mobilePlatform';
import { CustomScrollView } from './ui/CustomScrollView';
import { UserMetadataContext } from './UserMetadataContainer';

type Props = {};

export const PaymentSuccessModal: FC<Props> = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const posthog = usePostHog();
  const { t } = useTranslation();

  const { updateUserMetadata } = useContext(UserMetadataContext);

  const rateClick = () => {
    updateUserMetadata({
      rate: {
        [mobilePlatform]: {
          response: 'review',
          isoDate: new Date().toISOString(),
        },
      },
    });

    Linking.openURL(mobileStoreUrl).then();

    posthog.capture('mobilePaymentSuccessRate');
  };

  return (
    <>
      <CustomScrollView
        automaticallyAdjustKeyboardInsets={true}
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
        }}
      >
        <View>
          <Text
            variant="headlineMedium"
            style={{ textAlign: 'center', color: theme.colors.secondary }}
          >
            {t('paymentSuccess.thankYou')}
          </Text>
        </View>
        <View style={{ alignSelf: 'stretch' }}>
          <Button mode={'contained'} onPress={rateClick}>
            {t('paymentSuccess.rateButton', { storeName: mobileStoreName })}
          </Button>
        </View>
        <View>
          <Text style={{ textAlign: 'center' }}>
            {t('paymentSuccess.feedbackBefore')}{' '}
            <Text
              style={{ color: theme.colors.primary }}
              onPress={() => navigation.navigate('Feedback')}
            >
              {t('paymentSuccess.feedbackLink')}
            </Text>
            {t('paymentSuccess.feedbackAfter')}
          </Text>
        </View>
      </CustomScrollView>
    </>
  );
};
