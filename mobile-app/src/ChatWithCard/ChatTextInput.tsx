import Clipboard from '@react-native-clipboard/clipboard';
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Platform, TextInput, View } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';

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
    const [isFocused, setIsFocused] = useState(false);
    const [clipboardHasText, setClipboardHasText] = useState(false);
    const theme = useTheme();
    const inputRef = useRef<TextInput>(null);

    useImperativeHandle(ref, () => ({
      focus: () => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      },
    }));

    Clipboard.hasString().then((hasText) => setClipboardHasText(hasText));

    const setTextFromClipboard = async () => {
      const clipboardText = await Clipboard.getString();
      onChange(clipboardText);
    };

    const isSearchDisabled = value === '';
    return (
      <View
        style={{
          width: '100%',
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'center',
          borderStyle: 'solid',
          borderWidth: 1,
          borderColor: isFocused
            ? theme.colors.onSurface
            : theme.colors.tertiary,
          borderRadius: 12,
          opacity: disabled ? 0.5 : 1,
          backgroundColor: 'transparent',
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
            paddingTop: Platform.OS === 'android' ? 11 : 16,
            paddingBottom: 10,
            alignSelf: 'flex-start',
            maxHeight,
          }}
          multiline={multiline}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          value={value}
          autoCapitalize={'none'}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.tertiary}
          onSubmitEditing={() => onSubmit(value)}
          autoFocus={autoFocus}
        />
        <IconButton
          icon={'arrow-up-thin'}
          mode="contained"
          iconColor={theme.colors.onPrimary}
          style={{
            backgroundColor: isSearchDisabled
              ? 'transparent'
              : theme.colors.onSurface,
          }}
          onPress={() => onSubmit(value)}
          disabled={isSearchDisabled}
        />
      </View>
    );
  }
);
