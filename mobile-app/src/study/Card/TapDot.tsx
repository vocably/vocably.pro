import { FC, useEffect, useRef } from 'react';
import { Animated, StyleProp, ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = {
  style?: StyleProp<ViewStyle>;
};

const animationTDuration: number = 200;

export const TapDot: FC<Props> = ({ style }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const opacity = useRef(new Animated.Value(0.2)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const loopAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.4,
            duration: animationTDuration,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.2,
            duration: animationTDuration,
            useNativeDriver: true,
          }),
        ]),
        {
          resetBeforeIteration: true,
        }
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1,
            duration: animationTDuration,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.8,
            duration: animationTDuration,
            useNativeDriver: true,
          }),
        ]),
        {
          resetBeforeIteration: true,
        }
      ).start();
    };

    loopAnimation();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          zIndex: 999,
          opacity: 0.5,
          alignItems: 'center',
          pointerEvents: 'none',
        },
        { transform: [{ scale }] },
        style,
      ]}
    >
      <Icon name="gesture-tap" size={60} color={theme.colors.secondary} />
      <Text style={{ fontSize: 16, color: theme.colors.secondary }}>
        {t('study.tapDot.touch')}
      </Text>
    </Animated.View>
  );
};
