import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Animated, Platform, TextInput } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useAppTheme } from '../ThemeProvider';

type Props = {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  disabled?: boolean;
  multiline?: boolean;
  pasteFromClipboard?: boolean;
  maxHeight?: number;
  autoFocus?: boolean;
};

export type ChatTextInputRef = {
  focus: () => void;
};

export const ChatTextInput = forwardRef<ChatTextInputRef, Props>(
  (
    {
      value,
      placeholder,
      onChange,
      onSubmit,
      disabled = false,
      multiline = false,
      maxHeight = 200,
      autoFocus = false,
    },
    ref
  ) => {
    const theme = useAppTheme();
    const inputRef = useRef<TextInput>(null);
    const focusAnimation = useRef(new Animated.Value(0)).current;

    const handleFocus = () => {
      Animated.timing(focusAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    };

    const handleBlur = () => {
      Animated.timing(focusAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    };

    useImperativeHandle(ref, () => ({
      focus: () => {
        if (inputRef.current) {
          setTimeout(() => {
            inputRef.current && inputRef.current.focus();
          }, 100);
        }
      },
    }));

    const backgroundColor = focusAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [theme.colors.inputBg, theme.colors.inputBgFocused],
    });

    const isSearchDisabled = value === '';
    return (
      <Animated.View
        style={{
          width: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 16,
          opacity: disabled ? 0.5 : 1,
          backgroundColor: backgroundColor,
          paddingLeft: 12,
        }}
      >
        <TextInput
          ref={inputRef}
          style={{
            flex: 1,
            color: theme.colors.secondary,
            fontSize: 18,
            minHeight: 24,
            paddingTop: Platform.OS === 'android' ? 11 : 12,
            paddingBottom: 10,
          }}
          multiline={multiline}
          numberOfLines={1}
          editable={!disabled}
          onFocus={() => {
            handleFocus();
          }}
          onBlur={() => {
            handleBlur();
          }}
          value={value}
          autoCapitalize={'none'}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.tertiary}
          returnKeyType={'search'}
          onSubmitEditing={() => onSubmit(value)}
          autoFocus={autoFocus}
        />
        <IconButton
          icon={'arrow-up-thin'}
          mode="contained"
          iconColor={theme.colors.inputIconColor}
          style={{
            backgroundColor: 'transparent',
          }}
          onPress={() => onSubmit(value)}
          disabled={isSearchDisabled}
        />
      </Animated.View>
    );
  }
);
