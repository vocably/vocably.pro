import { useNavigation } from '@react-navigation/native';
import { usePostHog } from 'posthog-react-native';
import { FC, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Button, Text } from 'react-native-paper';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  mobilePlatform,
  mobileStoreName,
  mobileStoreUrl,
} from './mobilePlatform';
import { mainPadding } from './styles';
import { primaryShadow, useAppTheme } from './ThemeProvider';
import { CustomScrollView } from './ui/CustomScrollView';
import { UserMetadataContext } from './UserMetadataContainer';

const BADGE_SIZE = 96;
const HALO_SIZE = BADGE_SIZE + 64;

// A soft ring that keeps expanding and fading around the badge.
const Halo: FC<{ delay: number }> = ({ delay }) => {
  const theme = useAppTheme();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: 2600, easing: Easing.out(Easing.quad) }),
        -1,
        false
      )
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: 0.35 * (1 - progress.value),
    transform: [{ scale: 0.6 + progress.value * 0.5 }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: HALO_SIZE,
          height: HALO_SIZE,
          borderRadius: HALO_SIZE / 2,
          backgroundColor: theme.colors.primary,
        },
        style,
      ]}
    />
  );
};

const Sparkle: FC<{
  top: number;
  left: number;
  size: number;
  delay: number;
}> = ({ top, left, size, delay }) => {
  const theme = useAppTheme();
  const twinkle = useSharedValue(0);

  useEffect(() => {
    twinkle.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      )
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: 0.4 + twinkle.value * 0.6,
    transform: [{ scale: 0.8 + twinkle.value * 0.3 }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: 'absolute', top, left }, style]}
    >
      <Icon name="star-four-points" size={size} color={theme.colors.primary} />
    </Animated.View>
  );
};

const Badge: FC = () => {
  const theme = useAppTheme();

  return (
    <View
      style={{
        width: HALO_SIZE,
        height: HALO_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Halo delay={0} />
      <Halo delay={1300} />
      <Animated.View entering={ZoomIn.springify().damping(12)}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryVariant]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: BADGE_SIZE,
            height: BADGE_SIZE,
            borderRadius: BADGE_SIZE / 2,
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: primaryShadow(theme),
          }}
        >
          <Icon name="crown" size={48} color={theme.colors.onPrimary} />
        </LinearGradient>
      </Animated.View>
      <Sparkle top={6} left={HALO_SIZE - 34} size={22} delay={0} />
      <Sparkle top={HALO_SIZE - 38} left={10} size={16} delay={500} />
      <Sparkle top={28} left={6} size={12} delay={900} />
    </View>
  );
};

const enter = (index: number) =>
  FadeInDown.delay(250 + index * 120)
    .springify()
    .damping(16);

type Props = {};

export const PaymentSuccessModal: FC<Props> = () => {
  const navigation = useNavigation();
  const theme = useAppTheme();
  const posthog = usePostHog();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

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
    <CustomScrollView
      contentContainerStyle={{
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: mainPadding,
        paddingTop: 16,
        paddingBottom: insets.bottom + 24,
      }}
    >
      <View style={{ width: '100%', maxWidth: 480, alignItems: 'center' }}>
        <Badge />

        <Animated.View
          entering={enter(0)}
          style={{
            marginTop: 8,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingVertical: 4,
            paddingHorizontal: 12,
            borderRadius: 999,
            backgroundColor: theme.colors.inversePrimary,
          }}
        >
          <Icon name="check-decagram" size={16} color={theme.colors.primary} />
          <Text
            style={{
              color: theme.colors.primary,
              fontWeight: '600',
              letterSpacing: 0.5,
            }}
          >
            {t('premium.label')}
          </Text>
        </Animated.View>

        <Animated.View entering={enter(1)}>
          <Text
            variant="headlineMedium"
            style={{
              marginTop: 16,
              textAlign: 'center',
              fontWeight: '700',
              color: theme.colors.secondary,
            }}
          >
            {t('paymentSuccess.title')}
          </Text>
        </Animated.View>

        <Animated.View entering={enter(2)}>
          <Text
            variant="bodyLarge"
            style={{ marginTop: 12, textAlign: 'center', lineHeight: 24 }}
          >
            {t('paymentSuccess.thankYou')}
          </Text>
        </Animated.View>

        <Animated.View
          entering={enter(3)}
          style={{ alignSelf: 'stretch', marginTop: 32 }}
        >
          <Button
            testID="payment-success-rate"
            mode="contained"
            icon="star"
            onPress={rateClick}
            style={{
              borderRadius: 12,
              boxShadow: primaryShadow(theme),
            }}
            contentStyle={{ height: 48 }}
            labelStyle={{ fontSize: 16 }}
          >
            {t('paymentSuccess.rateButton', { storeName: mobileStoreName })}
          </Button>
        </Animated.View>

        <Animated.View
          entering={enter(4)}
          style={{
            alignSelf: 'stretch',
            marginTop: 24,
            padding: 16,
            borderRadius: 12,
            backgroundColor: theme.colors.inputBg,
            flexDirection: 'row',
            gap: 12,
          }}
        >
          <Icon
            name="message-text-outline"
            size={22}
            color={theme.colors.primary}
            style={{ marginTop: 1 }}
          />
          <Text style={{ flex: 1, lineHeight: 21 }}>
            {t('paymentSuccess.feedbackBefore')}{' '}
            <Text
              testID="payment-success-feedback-link"
              style={{ color: theme.colors.primary, fontWeight: '600' }}
              onPress={() => navigation.navigate('Feedback')}
            >
              {t('paymentSuccess.feedbackLink')}
            </Text>
            {t('paymentSuccess.feedbackAfter')}
          </Text>
        </Animated.View>

        <Animated.View entering={enter(5)} style={{ marginTop: 16 }}>
          <Button
            testID="payment-success-continue"
            mode="text"
            onPress={() => navigation.goBack()}
          >
            {t('paymentSuccess.continue')}
          </Button>
        </Animated.View>
      </View>
    </CustomScrollView>
  );
};
