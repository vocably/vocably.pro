import React, { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  Easing,
  Linking,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { Button, Text } from 'react-native-paper';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { mainPadding } from './styles';
import { primaryShadow, useAppTheme } from './ThemeProvider';
import { usePremium } from './usePremium';
import { usePresentPaywall } from './usePresentPaywall';

export const MAX_FREQUENCY = 10;

const OPEN_DURATION = 260;
const CLOSE_DURATION = 200;
// The drawer never covers the whole screen, so it's clear it can be closed by
// tapping above it.
const MAX_HEIGHT_RATIO = 0.85;
// Dragging the drawer down further than this, or flicking it, closes it.
const DISMISS_DISTANCE = 80;
const DISMISS_VELOCITY = 0.8;

type Props = {
  // 1 (rare) to 10 (most common)
  frequency: number;
  level: 1 | 2 | 3;
  visible: boolean;
  isSharedLookup: boolean;
  onClose: () => void;
  onUpgradePress?: () => void;
};

/**
 * A bottom drawer explaining the frequency indicator of a card. The content
 * mirrors `vocably-frequency-hint` of the browser extension.
 */
export const FrequencyHint: FC<Props> = ({
  frequency,
  level,
  visible,
  isSharedLookup,
  onClose,
  onUpgradePress,
}) => {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const isPremium = usePremium();
  const presentPaywall = usePresentPaywall();
  const { height: screenHeight } = useWindowDimensions();

  // The modal stays mounted while the drawer slides out.
  const [isModalVisible, setIsModalVisible] = useState(visible);
  const [showSettingsHint, setShowSettingsHint] = useState(false);
  const [drawerHeight, setDrawerHeight] = useState(screenHeight);
  const progress = useRef(new Animated.Value(0)).current;
  const dragY = useRef(new Animated.Value(0)).current;
  const scaleFill = useRef(new Animated.Value(0)).current;
  // The paywall can't be presented on top of the drawer modal, so it waits
  // until the modal is gone.
  const afterDismissRef = useRef<(() => void) | undefined>(undefined);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const runAfterDismiss = () => {
    const action = afterDismissRef.current;
    afterDismissRef.current = undefined;
    action?.();
  };

  useEffect(() => {
    if (visible) {
      setIsModalVisible(true);
      setShowSettingsHint(false);
      dragY.setValue(0);
      scaleFill.setValue(0);
      Animated.parallel([
        Animated.timing(progress, {
          toValue: 1,
          duration: OPEN_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scaleFill, {
          toValue: 1,
          duration: 500,
          delay: 200,
          easing: Easing.bezier(0.2, 0.8, 0.2, 1),
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    Animated.timing(progress, {
      toValue: 0,
      duration: CLOSE_DURATION,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) {
        return;
      }

      setIsModalVisible(false);
      // onDismiss is iOS-only, while Android can go on right away.
      if (Platform.OS !== 'ios') {
        runAfterDismiss();
      }
    });
  }, [visible, progress, dragY, scaleFill]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, { dy, dx }) =>
        dy > 4 && Math.abs(dy) > Math.abs(dx),
      onPanResponderMove: (_, { dy }) => dragY.setValue(Math.max(dy, 0)),
      onPanResponderRelease: (_, { dy, vy }) => {
        if (dy > DISMISS_DISTANCE || vy > DISMISS_VELOCITY) {
          onCloseRef.current();
          return;
        }

        Animated.spring(dragY, {
          toValue: 0,
          bounciness: 4,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderTerminate: () => {
        Animated.spring(dragY, { toValue: 0, useNativeDriver: true }).start();
      },
    })
  ).current;

  const upgrade = async () => {
    onUpgradePress?.();

    if (!isSharedLookup) {
      afterDismissRef.current = () => presentPaywall();
      onClose();
      return;
    }

    if (await Linking.canOpenURL('vocably-pro://upgrade')) {
      onClose();
      await Linking.openURL('vocably-pro://upgrade');
      return;
    }

    setShowSettingsHint(true);
  };

  const score = Math.min(Math.max(Math.round(frequency), 1), MAX_FREQUENCY);

  return (
    <Modal
      visible={isModalVisible}
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
      onDismiss={runAfterDismiss}
    >
      {/* The app isn't edge-to-edge on Android, so the insets of the app's
          provider are zero there, while this modal draws under the
          navigation bar. Its own provider measures the modal's window. */}
      <SafeAreaProvider>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: theme.colors.backdrop, opacity: progress },
          ]}
        >
          <Pressable
            testID="frequency-hint-backdrop"
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
          />
        </Animated.View>
        <Animated.View
          accessibilityViewIsModal
          onLayout={(event) => setDrawerHeight(event.nativeEvent.layout.height)}
          style={[
            styles.drawer,
            {
              maxHeight: screenHeight * MAX_HEIGHT_RATIO,
              backgroundColor: theme.colors.elevation.level1,
              transform: [
                {
                  translateY: Animated.add(
                    progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [drawerHeight, 0],
                    }),
                    dragY
                  ),
                },
              ],
            },
          ]}
        >
          <View {...panResponder.panHandlers} style={styles.handleArea}>
            <View
              style={[
                styles.handle,
                { backgroundColor: theme.colors.onSurfaceVariant },
              ]}
            />
          </View>
          <ScrollView
            bounces={false}
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
          >
            <View style={styles.header}>
              <Text
                variant="titleLarge"
                style={[styles.title, { color: theme.colors.onSurface }]}
              >
                {t(`common.frequency_${level}`)}
              </Text>
              <Text
                variant="titleMedium"
                style={[styles.score, { color: theme.colors.onSurfaceVariant }]}
              >
                {t('frequencyHint.score', { score, max: MAX_FREQUENCY })}
              </Text>
            </View>
            <View
              style={[
                styles.scale,
                { backgroundColor: theme.colors.elevation.level5 },
              ]}
            >
              <Animated.View
                style={[
                  styles.scaleFill,
                  {
                    width: `${(score / MAX_FREQUENCY) * 100}%`,
                    backgroundColor: theme.colors.primary,
                    transform: [{ scaleX: scaleFill }],
                  },
                ]}
              />
            </View>
            <Text
              variant="bodyLarge"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              {t(`frequencyHint.description_${level}`)}
            </Text>
            {!isPremium && (
              <View
                style={[
                  styles.premium,
                  { borderTopColor: theme.colors.outlineVariant },
                ]}
              >
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: theme.colors.primaryContainer },
                  ]}
                >
                  <Text
                    variant="labelMedium"
                    style={[
                      styles.badgeText,
                      { color: theme.colors.onPrimaryContainer },
                    ]}
                  >
                    {t('frequencyHint.premiumBadge')}
                  </Text>
                </View>
                <Text
                  variant="bodyLarge"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  {t('frequencyHint.premium')}
                </Text>
                {showSettingsHint ? (
                  <Text
                    variant="bodyLarge"
                    style={[styles.action, { color: theme.colors.onSurface }]}
                  >
                    {t('cardsLimit.openVocablySettings')}
                  </Text>
                ) : (
                  <Button
                    testID="frequency-hint-upgrade"
                    mode="contained"
                    onPress={upgrade}
                    icon={({ size, color }) => (
                      <MaterialIcon
                        name="workspace-premium"
                        size={size}
                        color={color}
                      />
                    )}
                    style={[styles.action, { boxShadow: primaryShadow(theme) }]}
                  >
                    {t('cardsLimit.upgradeToPremium')}
                  </Button>
                )}
              </View>
            )}
          </ScrollView>
          <BottomInset />
        </Animated.View>
      </SafeAreaProvider>
    </Modal>
  );
};

const BottomInset: FC = () => {
  const insets = useSafeAreaInsets();
  return <View style={{ height: insets.bottom }} />;
};

const styles = StyleSheet.create({
  drawer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 16,
  },
  // Taller than the handle itself, so it's easy to grab.
  handleArea: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 32,
    height: 4,
    borderRadius: 2,
    opacity: 0.4,
  },
  content: {
    flexGrow: 0,
    flexShrink: 1,
  },
  contentContainer: {
    paddingHorizontal: mainPadding,
    paddingTop: 8,
    // Lives inside the scroll view, so the upgrade button's shadow isn't
    // clipped.
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 14,
  },
  title: {
    flexShrink: 1,
    fontWeight: '600',
  },
  score: {
    fontVariant: ['tabular-nums'],
  },
  scale: {
    height: 6,
    marginBottom: 16,
    borderRadius: 3,
    overflow: 'hidden',
  },
  scaleFill: {
    height: '100%',
    borderRadius: 3,
    transformOrigin: 'left',
  },
  premium: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    alignItems: 'flex-start',
  },
  badge: {
    marginBottom: 10,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  badgeText: {
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  action: {
    alignSelf: 'stretch',
    marginTop: 20,
  },
});
