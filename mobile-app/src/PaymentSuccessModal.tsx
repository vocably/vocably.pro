import { useNavigation } from '@react-navigation/native';
import { usePostHog } from 'posthog-react-native';
import { FC, useContext } from 'react';
import { Linking, View } from 'react-native';
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
            Thank{'\u00A0'}you{'\u00A0'}for giving{'\u00A0'}Vocably{'\u00A0'}a
            {'\u00A0'}chance. Your{'\u00A0'}support means{'\u00A0'}a{'\u00A0'}
            lot.
          </Text>
        </View>
        <View style={{ alignSelf: 'stretch' }}>
          <Button mode={'contained'} onPress={rateClick}>
            Rate Vocably on {mobileStoreName}
          </Button>
        </View>
        <View>
          <Text style={{ textAlign: 'center' }}>
            If you are missing or don't like anything, you can always let me
            know in Discord, Telegram, or{' '}
            <Text
              style={{ color: theme.colors.primary }}
              onPress={() => navigation.navigate('Feedback')}
            >
              right in the app
            </Text>
            . I take every feedback seriously.
          </Text>
        </View>
      </CustomScrollView>
    </>
  );
};
