import { useNavigation } from '@react-navigation/native';
import { TagItem } from '@vocably/model';
import React, { FC, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Portal, Text } from 'react-native-paper';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { setSourceLanguage } from './SourceLanguageButton';
import { mainPadding } from './styles';
import { useAppTheme } from './ThemeProvider';
import { useTranslationPreset } from './TranslationPreset/useTranslationPreset';
import { Snackbar } from './ui/Snackbar';

const MINI_CARD_WIDTH = 64;
const MINI_CARD_HEIGHT = 84;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const pressSpring = { damping: 15, stiffness: 300 };

export const ScalePressable: FC<
  Omit<PressableProps, 'style'> & {
    pressedScale: number;
    style?: StyleProp<ViewStyle>;
  }
> = ({ pressedScale, style, onPressIn, onPressOut, ...props }) => {
  const scale = useSharedValue(1);

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      {...props}
      onPressIn={(event) => {
        scale.value = withSpring(pressedScale, pressSpring);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.value = withSpring(1, pressSpring);
        onPressOut?.(event);
      }}
      style={[style, scaleStyle]}
    />
  );
};

const BackCard: FC<{ rotate: string; translateX: number }> = ({
  rotate,
  translateX,
}) => {
  const theme = useAppTheme();

  return (
    <View
      style={{
        position: 'absolute',
        width: MINI_CARD_WIDTH,
        height: MINI_CARD_HEIGHT,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.inversePrimary,
        backgroundColor: theme.colors.elevation.level2,
        padding: 10,
        gap: 6,
        transform: [{ translateX }, { rotate }],
      }}
    >
      <View
        style={{
          height: 6,
          width: '70%',
          borderRadius: 3,
          backgroundColor: theme.colors.inversePrimary,
        }}
      />
      <View
        style={{
          height: 6,
          width: '45%',
          borderRadius: 3,
          backgroundColor: theme.colors.inversePrimary,
        }}
      />
    </View>
  );
};

const CardsIllustration: FC<{ onPress: () => void }> = ({ onPress }) => {
  const theme = useAppTheme();
  const offset = useSharedValue(0);

  useEffect(() => {
    offset.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, [offset]);

  const floatingStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.value }],
  }));

  return (
    <Animated.View entering={FadeIn.duration(500)}>
      <ScalePressable
        testID="dashboard-empty-illustration"
        onPress={onPress}
        pressedScale={0.9}
        style={{
          height: MINI_CARD_HEIGHT + 24,
          width: MINI_CARD_WIDTH * 2.6,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <BackCard rotate="-12deg" translateX={-34} />
        <BackCard rotate="12deg" translateX={34} />
        <Animated.View style={floatingStyle}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryVariant]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: MINI_CARD_WIDTH + 8,
              height: MINI_CARD_HEIGHT + 8,
              borderRadius: 14,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="plus" size={34} color={theme.colors.onPrimary} />
          </LinearGradient>
        </Animated.View>
      </ScalePressable>
    </Animated.View>
  );
};

export const ActionTile: FC<{
  icon: string;
  title: string;
  description: string;
  highlighted: boolean;
  index: number;
  onPress: () => void;
  testID: string;
  animated?: boolean;
}> = ({
  icon,
  title,
  description,
  highlighted,
  index,
  onPress,
  testID,
  animated = true,
}) => {
  const theme = useAppTheme();
  const foreground = highlighted
    ? theme.colors.onPrimary
    : theme.colors.primary;

  return (
    <Animated.View
      entering={
        animated
          ? FadeInDown.delay(200 + index * 80)
              .springify()
              .damping(18)
          : undefined
      }
    >
      <ScalePressable
        testID={testID}
        onPress={onPress}
        pressedScale={0.96}
        accessibilityRole="button"
        accessibilityLabel={title}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
            padding: 16,
            borderRadius: 16,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: highlighted
              ? theme.colors.primary
              : theme.colors.inversePrimary,
            backgroundColor: theme.colors.elevation.level1,
          }}
        >
          {highlighted && (
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryVariant]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          )}
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: highlighted
                ? 'rgba(255, 255, 255, 0.2)'
                : theme.colors.inversePrimary,
            }}
          >
            <Icon name={icon} size={24} color={foreground} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text
              style={{
                fontSize: 17,
                fontWeight: '600',
                color: highlighted
                  ? theme.colors.onPrimary
                  : theme.colors.secondary,
              }}
            >
              {title}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: highlighted
                  ? theme.colors.onPrimary
                  : theme.colors.onSurface,
                opacity: 0.85,
              }}
            >
              {description}
            </Text>
          </View>
          <Icon name="chevron-right" size={24} color={foreground} />
        </View>
      </ScalePressable>
    </Animated.View>
  );
};

const Steps: FC = () => {
  const theme = useAppTheme();
  const { t } = useTranslation();

  const steps = [
    { icon: 'magnify', label: t('dashboard.empty.stepFind') },
    { icon: 'card-plus-outline', label: t('dashboard.empty.stepSave') },
    { icon: 'brain', label: t('dashboard.empty.stepRemember') },
  ];

  return (
    <Animated.View
      entering={FadeIn.delay(450).duration(500)}
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'center',
      }}
    >
      {steps.map((step, index) => (
        <React.Fragment key={step.icon}>
          {index > 0 && (
            <Icon
              name="chevron-right"
              size={18}
              color={theme.colors.inversePrimary}
              style={{ marginTop: 9 }}
            />
          )}
          <View style={{ flex: 1, alignItems: 'center', gap: 6 }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.colors.elevation.level2,
              }}
            >
              <Icon name={step.icon} size={20} color={theme.colors.primary} />
            </View>
            <Text
              style={{
                fontSize: 13,
                textAlign: 'center',
                opacity: 0.8,
              }}
            >
              {step.label}
            </Text>
          </View>
        </React.Fragment>
      ))}
    </Animated.View>
  );
};

const FilteredMessage: FC<{ icon: string; children: React.ReactNode }> = ({
  icon,
  children,
}) => {
  const theme = useAppTheme();

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={{ alignItems: 'center', gap: 16 }}
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.elevation.level2,
        }}
      >
        <Icon name={icon} size={28} color={theme.colors.primary} />
      </View>
      <Text style={{ fontSize: 16, textAlign: 'center' }}>{children}</Text>
    </Animated.View>
  );
};

type Props = {
  language: string;
  isSearching: boolean;
  searchText: string;
  selectedTags: TagItem[];
};

export const DashboardEmptyState: FC<Props> = ({
  language,
  isSearching,
  searchText,
  selectedTags,
}) => {
  const theme = useAppTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const presetState = useTranslationPreset();
  const [isCuriousVisible, setIsCuriousVisible] = useState(false);

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

  const bold = <Text style={{ fontWeight: 'bold' }} />;

  return (
    <View
      style={{
        paddingHorizontal: mainPadding,
        paddingTop: mainPadding,
        paddingBottom: mainPadding,
        alignItems: 'center',
        width: '100%',
      }}
    >
      {!isSearching && selectedTags.length === 0 && (
        <View style={{ width: '100%', maxWidth: 480, gap: 24 }}>
          <View style={{ alignItems: 'center', gap: 12 }}>
            <CardsIllustration onPress={() => setIsCuriousVisible(true)} />
            <Animated.View
              entering={FadeInDown.delay(100).springify().damping(18)}
              style={{ gap: 8 }}
            >
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 22,
                  fontWeight: '600',
                  color: theme.colors.secondary,
                }}
              >
                {t('dashboard.empty.title')}
              </Text>
              <Text style={{ textAlign: 'center', fontSize: 15, opacity: 0.8 }}>
                {t('dashboard.empty.subtitle')}
              </Text>
            </Animated.View>
          </View>
          <View style={{ gap: 12 }}>
            <ActionTile
              testID="dashboard-empty-look-up"
              index={0}
              highlighted={true}
              icon="translate"
              title={t('dashboard.empty.lookUpTitle')}
              description={t('dashboard.empty.lookUpDescription')}
              onPress={() => navigateWithDeckLanguage('LookUp')}
            />
            <ActionTile
              testID="dashboard-empty-generator"
              index={1}
              highlighted={false}
              icon="palette-swatch-outline"
              title={t('dashboard.empty.generatorTitle')}
              description={t('dashboard.empty.generatorDescription')}
              onPress={() => navigateWithDeckLanguage('GenerateCards')}
            />
          </View>
          <Steps />
        </View>
      )}
      {isSearching && searchText && (
        <FilteredMessage icon="text-search">
          <Trans
            i18nKey="dashboard.empty.noCardsForSearch"
            values={{ searchText }}
            components={{ bold }}
          />
        </FilteredMessage>
      )}
      {selectedTags.length === 1 && (
        <FilteredMessage icon="tag-outline">
          <Trans
            i18nKey="dashboard.empty.noCardsForTag"
            values={{ tagTitle: selectedTags[0].data.title }}
            components={{ bold }}
          />
        </FilteredMessage>
      )}
      {selectedTags.length > 1 && (
        <FilteredMessage icon="tag-multiple-outline">
          {t('dashboard.empty.noCardsForTags')}
        </FilteredMessage>
      )}
      <Portal>
        <Snackbar
          visible={isCuriousVisible}
          onDismiss={() => setIsCuriousVisible(false)}
          duration={3000}
        >
          {t('dashboard.empty.curious')}
        </Snackbar>
      </Portal>
    </View>
  );
};
