import { usePostHog } from 'posthog-react-native';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PixelRatio,
  Pressable,
  PressableStateCallbackType,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { FrequencyHint } from './FrequencyHint';
import { useIsFrequencyAvailable } from './useIsFrequencyAvailable';

const FREQUENCY_BARS = 3;
const BAR_HEIGHTS = [5, 8, 11];
const PADDING_X = 6;
const PADDING_Y = 4;

// Frequency comes as 1 (rare) to 10 (most common).
export const frequencyToLevel = (frequency: number): 1 | 2 | 3 => {
  if (frequency >= 8) {
    return 3;
  }

  if (frequency >= 5) {
    return 2;
  }

  return 1;
};

type Props = {
  // 1 (rare) to 10 (most common)
  frequency: number;
  source: string;
  language: string;
  isSharedLookup?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const FrequencyIndicator: FC<Props> = ({
  frequency,
  source,
  language,
  isSharedLookup = false,
  style,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const posthog = usePostHog();
  const fontScale = PixelRatio.getFontScale();
  const [isHintVisible, setIsHintVisible] = useState(false);
  const isAvailable = useIsFrequencyAvailable();

  const level = frequencyToLevel(frequency);

  const openHint = () => {
    setIsHintVisible(true);
    posthog.capture('frequencyHintOpened', {
      source,
      language,
      frequency,
      level,
      isAvailable,
    });
  };

  const trackUpgrade = () => {
    posthog.capture('frequencyHintUpgradeClicked', {
      source,
      language,
      frequency,
      level,
      isAvailable,
      isSharedLookup,
    });
  };

  return (
    // The drawer modal lives in this wrapper rather than in the text the
    // indicator is inlined into.
    <View style={style}>
      <Pressable
        testID="frequency-indicator"
        onPress={openHint}
        hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
        accessibilityRole="button"
        accessibilityLabel={
          isAvailable
            ? t(`common.frequency_${level}`)
            : t('frequencyHint.unavailable')
        }
        accessibilityHint={t('frequencyHint.accessibilityHint')}
        style={{
          // Bars grow from a shared baseline, like a signal-strength meter.
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: 2 * fontScale,
          // A pill around the bars, offset by negative margins so it
          // doesn't move the surrounding text.
          paddingHorizontal: PADDING_X,
          paddingVertical: PADDING_Y,
          marginHorizontal: -PADDING_X,
          marginVertical: -PADDING_Y,
          borderRadius: 10,
        }}
      >
        {({ pressed }: PressableStateCallbackType) => {
          const isActive = pressed || isHintVisible;

          return (
            <>
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0,
                  borderRadius: 10,
                  backgroundColor: theme.colors.primary,
                  opacity: isActive ? 0.12 : 0,
                }}
              />
              {/* Once the free time is over, the bars stay unfilled, so they
                  don't give the level away. */}
              {Array.from({ length: FREQUENCY_BARS }, (_, index) => (
                <View
                  key={index}
                  style={{
                    width: 3 * fontScale,
                    height: BAR_HEIGHTS[index] * fontScale,
                    borderRadius: 1,
                    backgroundColor: theme.colors.primary,
                    opacity:
                      isAvailable && index < level
                        ? isActive
                          ? 1
                          : 0.8
                        : isActive
                          ? 0.25
                          : 0.15,
                  }}
                />
              ))}
            </>
          );
        }}
      </Pressable>
      <FrequencyHint
        frequency={frequency}
        level={level}
        isAvailable={isAvailable}
        visible={isHintVisible}
        isSharedLookup={isSharedLookup}
        onClose={() => setIsHintVisible(false)}
        onUpgradePress={trackUpgrade}
      />
    </View>
  );
};
