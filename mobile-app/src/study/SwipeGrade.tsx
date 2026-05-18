import { SrsScore } from '@vocably/srs';
import React, {
  createContext,
  FC,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { PADDING_VERTICAL } from './StudyScreen';
import { usePostHog } from 'posthog-react-native';

const WEAK_SCORE = 0;
const MEDIUM_SCORE = 3;
const STRONG_SCORE = 5;

const buttonAnimationDuration = 300;

const styles = StyleSheet.create({
  icon: {
    position: 'absolute',
  },
});

const AnimatedIcon = Animated.createAnimatedComponent(Icon);

const iconSize = 80;
const buttonBigBorderRadius = 16;
const buttonSmallBorderRadius = 4;
const buttonsBottom = 18;

let rankButtonsHeightCache = 0;

export const SwipeGrade: FC<{
  onGrade: (score: SrsScore) => void;
  children: ReactNode;
}> = ({ onGrade, children }) => {
  const theme = useTheme();
  const postHog = usePostHog();

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const sufficientHorizontalDisplacement = Math.min(windowWidth / 4, 110);
  const sufficientVerticalDisplacement = Math.min(windowHeight / 5, 110);
  const minimalQuickDisplacement = 10;
  const [rankButtonsHeight, setRankButtonsHeight] = useState(
    rankButtonsHeightCache
  );

  const [selectedGrade, setSelectedGrade] = useState(-1);

  const pan = useRef(
    new Animated.ValueXY(undefined, {
      useNativeDriver: true,
    })
  ).current;
  const movementRef = useRef<null | 'horizontal' | 'vertical'>(null);
  const movementStartRef = useRef<number>(0);
  const weakVisibility = useRef(
    new Animated.Value(0, {
      useNativeDriver: true,
    })
  ).current;
  const mediumVisibility = useRef(
    new Animated.Value(0, {
      useNativeDriver: true,
    })
  ).current;
  const strongVisibility = useRef(
    new Animated.Value(0, {
      useNativeDriver: true,
    })
  ).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) >= 8 || Math.abs(gestureState.dy) >= 8;
      },
      onPanResponderGrant: () => {
        movementStartRef.current = Date.now();
        pan.setOffset({
          x: 0,
          y: 0,
        });
      },
      onPanResponderMove: (evt, gestureState) => {
        if (movementRef.current === null) {
          if (Math.abs(gestureState.dx * 2) > Math.abs(gestureState.dy)) {
            movementRef.current = 'horizontal';
          } else if (Math.abs(gestureState.dy) > 5) {
            movementRef.current = 'vertical';
          }
        }

        if (movementRef.current === null) {
          return;
        }

        if (movementRef.current === 'horizontal') {
          if (gestureState.dx > 0) {
            strongVisibility.setValue(
              Math.min(1, gestureState.dx / sufficientHorizontalDisplacement)
            );
            weakVisibility.setValue(0);
          } else {
            weakVisibility.setValue(
              Math.min(
                1,
                Math.abs(gestureState.dx) / sufficientHorizontalDisplacement
              )
            );
            strongVisibility.setValue(0);
          }

          pan.setValue({
            x: gestureState.dx,
            y: 0,
          });
        } else if (movementRef.current === 'vertical') {
          mediumVisibility.setValue(
            Math.min(1, gestureState.dy / sufficientVerticalDisplacement)
          );

          pan.setValue({
            x: 0,
            y: gestureState.dy,
          });
        }
      },
      onPanResponderRelease: async (_, gestureState) => {
        if ((weakVisibility as any)._value === 1) {
          postHog.capture('swipe_grade', {
            score: 0,
          });
          onGrade(0);
          return;
        }

        if ((mediumVisibility as any)._value === 1) {
          postHog.capture('swipe_grade', {
            score: 3,
          });
          onGrade(3);
          return;
        }

        if ((strongVisibility as any)._value === 1) {
          postHog.capture('swipe_grade', {
            score: 5,
          });
          onGrade(5);
          return;
        }

        if (Date.now() - movementStartRef.current < 100) {
          const fastReleaseAnimationDuration = 20;
          if (
            (weakVisibility as any)._value > 0 &&
            Math.abs(gestureState.dx) >= minimalQuickDisplacement
          ) {
            Animated.timing(weakVisibility, {
              toValue: 1,
              duration: fastReleaseAnimationDuration,
              useNativeDriver: true,
            }).start(() => {
              postHog.capture('swipe_grade', {
                score: WEAK_SCORE,
              });
              onGrade(WEAK_SCORE);
            });
            return;
          }

          if (
            (mediumVisibility as any)._value > 0 &&
            Math.abs(gestureState.dy) >= minimalQuickDisplacement
          ) {
            Animated.timing(mediumVisibility, {
              toValue: 1,
              duration: fastReleaseAnimationDuration,
              useNativeDriver: true,
            }).start(() => {
              postHog.capture('swipe_grade', {
                score: MEDIUM_SCORE,
              });
              onGrade(MEDIUM_SCORE);
            });
            return;
          }

          if (
            (strongVisibility as any)._value > 0 &&
            Math.abs(gestureState.dx) >= minimalQuickDisplacement
          ) {
            Animated.timing(strongVisibility, {
              toValue: 1,
              duration: fastReleaseAnimationDuration,
              useNativeDriver: true,
            }).start(() => {
              postHog.capture('swipe_grade', {
                score: STRONG_SCORE,
              });
              onGrade(STRONG_SCORE);
            });
            return;
          }
        }

        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          bounciness: 12,
          speed: 48,
          useNativeDriver: true,
        }).start();

        weakVisibility.setValue(0);
        mediumVisibility.setValue(0);
        strongVisibility.setValue(0);
        movementRef.current = null;
      },
    })
  ).current;

  const weak = () => {
    setSelectedGrade(1);
    Animated.parallel([
      Animated.timing(pan.x, {
        toValue: -windowWidth,
        duration: buttonAnimationDuration,
        useNativeDriver: true,
      }),
      Animated.timing(weakVisibility, {
        toValue: 1,
        duration: buttonAnimationDuration,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onGrade(WEAK_SCORE);
    });
  };

  const medium = () => {
    setSelectedGrade(3);
    Animated.parallel([
      Animated.timing(pan.y, {
        toValue: windowHeight,
        duration: buttonAnimationDuration,
        useNativeDriver: true,
      }),
      Animated.timing(mediumVisibility, {
        toValue: 1,
        duration: buttonAnimationDuration,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onGrade(MEDIUM_SCORE);
    });
  };

  const strong = () => {
    setSelectedGrade(5);
    Animated.parallel([
      Animated.timing(pan.x, {
        toValue: windowWidth,
        duration: buttonAnimationDuration,
        useNativeDriver: true,
      }),
      Animated.timing(strongVisibility, {
        toValue: 1,
        duration: buttonAnimationDuration,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onGrade(STRONG_SCORE);
    });
  };

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
      }}
    >
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          overflow: 'hidden',
          marginBottom: rankButtonsHeight,
          opacity: rankButtonsHeight === 0 ? 0 : 1,
        }}
      >
        {/* We need the below container to move icons a bit upper to consider bottom padding */}
        <View
          style={{
            pointerEvents: 'none',
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: PADDING_VERTICAL + 24,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AnimatedIcon
            style={[
              styles.icon,
              {
                color: theme.colors.primary,
              },
              {
                opacity: strongVisibility,
                transform: [{ scale: strongVisibility }],
              },
            ]}
            name="check-all"
            size={iconSize}
          ></AnimatedIcon>
          <AnimatedIcon
            style={[
              styles.icon,
              {
                color: theme.colors.primary,
              },
              {
                opacity: mediumVisibility,
                transform: [{ scale: mediumVisibility }],
              },
            ]}
            name="check"
            size={iconSize}
          ></AnimatedIcon>
          <AnimatedIcon
            style={[
              styles.icon,
              {
                color: theme.colors.error,
              },
              {
                opacity: weakVisibility,
                transform: [{ scale: weakVisibility }],
              },
            ]}
            name="close"
            size={iconSize}
          ></AnimatedIcon>
        </View>
        <Animated.View
          style={[
            {
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
            },
            { transform: [{ translateX: pan.x }, { translateY: pan.y }] },
          ]}
          {...panResponder.panHandlers}
        >
          {children}
        </Animated.View>
      </View>
      <View
        style={{
          position: 'absolute',
          bottom: buttonsBottom,
          paddingLeft: 16 + insets.left,
          paddingRight: 16 + insets.right,
          left: 0,
          right: 0,
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 6,
        }}
        onLayout={(event) => {
          rankButtonsHeightCache =
            event.nativeEvent.layout.height + buttonsBottom;
          setRankButtonsHeight(rankButtonsHeightCache);
        }}
      >
        <TouchableRipple
          onPress={weak}
          borderless={true}
          style={{
            flex: 1,
            borderTopLeftRadius: buttonBigBorderRadius,
            borderBottomLeftRadius: buttonBigBorderRadius,
            borderRadius: buttonSmallBorderRadius,
            borderWidth: 1,
            borderColor: theme.colors.primary,
            backgroundColor:
              selectedGrade === 1
                ? theme.colors.primary
                : theme.colors.background,
          }}
        >
          <View
            style={{
              gap: 4,
              alignItems: 'center',
              justifyContent: 'center',
              padding: 8,
            }}
          >
            <Icon
              name="close"
              color={
                selectedGrade === 1
                  ? theme.colors.onPrimary
                  : theme.colors.primary
              }
              size={24}
            />
            <Text
              style={{
                color:
                  selectedGrade === 1
                    ? theme.colors.onPrimary
                    : theme.colors.primary,
              }}
            >
              Not yet
            </Text>
          </View>
        </TouchableRipple>
        <TouchableRipple
          onPress={medium}
          borderless={true}
          style={{
            backgroundColor:
              selectedGrade === 3
                ? theme.colors.primary
                : theme.colors.background,
            borderRadius: buttonSmallBorderRadius,
            flex: 1,
            borderWidth: 1,
            borderColor: theme.colors.primary,
          }}
        >
          <View
            style={{
              gap: 4,
              alignItems: 'center',
              justifyContent: 'center',
              padding: 8,
            }}
          >
            <Icon
              name="check"
              color={
                selectedGrade === 3
                  ? theme.colors.onPrimary
                  : theme.colors.primary
              }
              size={24}
            />
            <Text
              style={{
                color:
                  selectedGrade === 3
                    ? theme.colors.onPrimary
                    : theme.colors.primary,
              }}
            >
              Almost
            </Text>
          </View>
        </TouchableRipple>

        <TouchableRipple
          onPress={strong}
          borderless={true}
          style={{
            flex: 1,
            borderRadius: buttonSmallBorderRadius,
            borderTopRightRadius: buttonBigBorderRadius,
            borderBottomRightRadius: buttonBigBorderRadius,
            borderWidth: 1,
            borderColor: theme.colors.primary,
            backgroundColor:
              selectedGrade === 5
                ? theme.colors.primary
                : theme.colors.background,
          }}
        >
          <View
            style={{
              gap: 4,
              alignItems: 'center',
              justifyContent: 'center',
              padding: 8,
            }}
          >
            <Icon
              name="check-all"
              color={
                selectedGrade === 5
                  ? theme.colors.onPrimary
                  : theme.colors.primary
              }
              size={24}
            />
            <Text
              style={{
                color:
                  selectedGrade === 5
                    ? theme.colors.onPrimary
                    : theme.colors.primary,
              }}
            >
              Got it!
            </Text>
          </View>
        </TouchableRipple>
      </View>
    </View>
  );
};
