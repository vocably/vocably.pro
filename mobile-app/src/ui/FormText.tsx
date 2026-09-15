import { FC, ReactNode, useCallback, useRef } from 'react';
import {
  Animated,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from '../ThemeProvider';

type Props = TextInputProps & {
  style?: ViewStyle;
  inputStyle?: TextInputProps['style'];
  label?: string;
  right?: ReactNode;
};

export const FormText: FC<Props> = ({
  style,
  onFocus,
  onBlur,
  inputStyle,
  label,
  right,
  ...textInputProps
}) => {
  const theme = useAppTheme();
  const focusAnimation = useRef(new Animated.Value(0)).current;

  const onFocusReloaded = useCallback(
    (e: any) => {
      Animated.timing(focusAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
      onFocus && onFocus(e);
    },
    [onFocus, focusAnimation]
  );

  const onBlurReloaded = useCallback(
    (e: any) => {
      Animated.timing(focusAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
      onBlur && onBlur(e);
    },
    [onBlur, focusAnimation]
  );

  const backgroundColor = focusAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.inputBg, theme.colors.inputBgFocused],
  });

  return (
    <View
      style={[
        {
          gap: 16,
        },
        style,
      ]}
    >
      {label && <Text>{label}</Text>}
      <Animated.View
        style={{
          backgroundColor,
          borderRadius: 16,
          paddingHorizontal: 12,
          flexDirection: 'row',
        }}
      >
        <TextInput
          style={[
            {
              color: theme.colors.secondary,
              textAlignVertical: 'top',
              fontSize: 16,
              flexGrow: 1,
              paddingTop: 16,
              paddingBottom: 16,
            },
            inputStyle,
          ]}
          placeholderTextColor={theme.colors.tertiary}
          {...textInputProps}
          onFocus={onFocusReloaded}
          onBlur={onBlurReloaded}
        ></TextInput>
        {right}
      </Animated.View>
    </View>
  );
};
