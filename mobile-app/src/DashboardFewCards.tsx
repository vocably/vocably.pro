import { useNavigation } from '@react-navigation/native';
import { usePostHog } from 'posthog-react-native';
import React, { FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Platform, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Text } from 'react-native-paper';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ActionTile, ScalePressable } from './DashboardEmptyState';
import { setSourceLanguage } from './SourceLanguageButton';
import { mainPadding } from './styles';
import { useAppTheme } from './ThemeProvider';
import { useTranslationPreset } from './TranslationPreset/useTranslationPreset';

// The footer is shown while the collection has this many cards or fewer.
export const FEW_CARDS_THRESHOLD = 5;

// One slot more than the threshold: filling the last one hides the footer.
const SLOTS = FEW_CARDS_THRESHOLD + 1;
const SLOT_WIDTH = 34;
const SLOT_HEIGHT = 46;

const FilledSlot: FC<{ index: number; animated: boolean }> = ({
  index,
  animated,
}) => {
  const theme = useAppTheme();

  return (
    <Animated.View
      entering={
        animated
          ? FadeInDown.delay(100 + index * 70)
              .springify()
              .damping(14)
          : undefined
      }
    >
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryVariant]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: SLOT_WIDTH,
          height: SLOT_HEIGHT,
          borderRadius: 8,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name="check" size={18} color={theme.colors.onPrimary} />
      </LinearGradient>
    </Animated.View>
  );
};

const EmptySlot: FC<{
  index: number;
  animated: boolean;
  isNext: boolean;
  onPress: () => void;
}> = ({ index, animated, isNext, onPress }) => {
  const theme = useAppTheme();
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (!isNext) {
      return;
    }

    pulse.value = withDelay(
      600,
      withRepeat(
        withSequence(
          withTiming(1.12, { duration: 700, easing: Easing.inOut(Easing.sin) }),
          withTiming(1, { duration: 700, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
  }, [isNext, pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <Animated.View
      entering={
        animated ? FadeIn.delay(100 + index * 70).duration(400) : undefined
      }
    >
      <ScalePressable
        testID={`dashboard-few-cards-slot-${index}`}
        onPress={onPress}
        pressedScale={0.85}
        hitSlop={4}
      >
        <Animated.View
          style={[
            {
              width: SLOT_WIDTH,
              height: SLOT_HEIGHT,
              borderRadius: 8,
              borderWidth: 1.5,
              borderStyle: 'dashed',
              borderColor: isNext
                ? theme.colors.primary
                : theme.colors.inversePrimary,
              alignItems: 'center',
              justifyContent: 'center',
            },
            pulseStyle,
          ]}
        >
          <Icon
            name="plus"
            size={18}
            color={isNext ? theme.colors.primary : theme.colors.inversePrimary}
          />
        </Animated.View>
      </ScalePressable>
    </Animated.View>
  );
};

type Props = {
  language: string;
  cardsCount: number;
  // Skips the entering animations, e.g. when the list remounts
  // after a section has been expanded or collapsed.
  skipEntering?: boolean;
  onAppear?: () => void;
};

export const DashboardFewCards: FC<Props> = ({
  language,
  cardsCount,
  skipEntering = false,
  onAppear,
}) => {
  const theme = useAppTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const presetState = useTranslationPreset();
  const posthog = usePostHog();

  const navigateWithDeckLanguage = (screen: string) => {
    navigation.navigate(screen);
    if (presetState.status === 'known') {
      presetState.setPreset(
        setSourceLanguage(
          language,
          presetState.preset,
          presetState.languagePairs
        )
      );
    }
  };

  const languagePath =
    presetState.status === 'known' && presetState.preset.translationLanguage
      ? `${language}/${presetState.preset.translationLanguage}`
      : language;

  const openLookUp = () => {
    posthog.capture('dashboardFewCardsLookUp', { cardsCount });
    navigateWithDeckLanguage('LookUp');
  };

  const isIos = Platform.OS === 'ios';
  const animated = !skipEntering;

  useEffect(() => {
    onAppear?.();
  }, []);

  return (
    <View
      style={{
        paddingHorizontal: mainPadding,
        paddingTop: 24,
        paddingBottom: mainPadding * 2,
        alignItems: 'center',
        width: '100%',
      }}
    >
      <View style={{ width: '100%', maxWidth: 480, gap: 12 }}>
        <Animated.View
          entering={animated ? FadeInDown.springify().damping(18) : undefined}
          style={{
            borderRadius: 20,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: theme.colors.inversePrimary,
          }}
        >
          <LinearGradient
            colors={[
              theme.colors.elevation.level2,
              theme.colors.elevation.level1,
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={{ padding: 20, gap: 16, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {Array.from({ length: SLOTS }, (_, index) =>
                index < cardsCount ? (
                  <FilledSlot key={index} index={index} animated={animated} />
                ) : (
                  <EmptySlot
                    animated={animated}
                    key={index}
                    index={index}
                    isNext={index === cardsCount}
                    onPress={openLookUp}
                  />
                )
              )}
            </View>
            <View style={{ gap: 8 }}>
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 20,
                  fontWeight: '600',
                  color: theme.colors.secondary,
                }}
              >
                {t('dashboard.fewCards.title', { count: cardsCount })}
              </Text>
              <Text
                style={{ textAlign: 'center', fontSize: 15, opacity: 0.85 }}
              >
                {t('dashboard.fewCards.message')}
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 15,
                  fontWeight: '600',
                  color: theme.colors.primary,
                }}
              >
                {t('dashboard.fewCards.habit')}
              </Text>
            </View>
          </View>
        </Animated.View>

        <ActionTile
          animated={animated}
          testID="dashboard-few-cards-look-up"
          index={0}
          highlighted={true}
          icon="translate"
          title={t('dashboard.fewCards.lookUpTitle')}
          description={t('dashboard.fewCards.lookUpDescription')}
          onPress={openLookUp}
        />
        <ActionTile
          animated={animated}
          testID="dashboard-few-cards-generator"
          index={1}
          highlighted={false}
          icon="palette-swatch-outline"
          title={t('dashboard.fewCards.generatorTitle')}
          description={t('dashboard.fewCards.generatorDescription')}
          onPress={() => {
            posthog.capture('dashboardFewCardsGenerator', { cardsCount });
            navigateWithDeckLanguage('GenerateCards');
          }}
        />
        {isIos ? (
          <ActionTile
            animated={animated}
            testID="dashboard-few-cards-safari"
            index={2}
            highlighted={false}
            icon="apple-safari"
            title={t('dashboard.fewCards.safariTitle')}
            description={t('dashboard.fewCards.safariDescription')}
            onPress={() => {
              posthog.capture('dashboardFewCardsSafari', { cardsCount });
              Linking.openURL(
                `https://app.vocably.pro/page/ios-extension/${languagePath}`
              );
            }}
          />
        ) : (
          <ActionTile
            animated={animated}
            testID="dashboard-few-cards-android"
            index={2}
            highlighted={false}
            icon="gesture-tap-hold"
            title={t('dashboard.fewCards.androidTitle')}
            description={t('dashboard.fewCards.androidDescription')}
            onPress={() => {
              posthog.capture('dashboardFewCardsAndroid', { cardsCount });
              Linking.openURL(
                `https://app.vocably.pro/page/android-translate/${languagePath}`
              );
            }}
          />
        )}
      </View>
    </View>
  );
};
