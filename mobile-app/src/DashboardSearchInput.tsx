import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleProp, TextInput, View, ViewStyle } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = {
  style?: StyleProp<ViewStyle>;
  value: string;
  onChange: (value: string) => void;
};

export type DashboardSearchInputRef = {
  focus: () => void;
  blur: () => void;
};

export const DashboardSearchInput = forwardRef<DashboardSearchInputRef, Props>(
  ({ style, value, onChange }, ref) => {
    const theme = useTheme();
    const { t } = useTranslation();

    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<TextInput>(null);

    useImperativeHandle(ref, () => ({
      blur: () => {
        if (inputRef.current) {
          inputRef.current.blur();
        }
      },
      focus: () => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      },
    }));

    return (
      <Pressable
        onPress={() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }}
      >
        <View
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              borderColor: isFocused
                ? theme.colors.onSurface
                : theme.colors.tertiary,
              borderWidth: 1,
              borderRadius: 8,
              paddingLeft: 8,
              paddingRight: 0,
              gap: 6,
              backgroundColor: theme.colors.background,
            },
            style,
          ]}
        >
          <Icon
            name="magnify"
            size={24}
            color={theme.colors.outlineVariant}
            style={{
              opacity: 0.5,
            }}
          />
          <TextInput
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            ref={inputRef}
            style={{
              flex: 1,
              height: '100%',
              fontSize: 16,
              color: theme.colors.secondary,
              padding: 0,
            }}
            placeholder={t('dashboard.searchPlaceholder')}
            value={value}
            onChangeText={onChange}
            returnKeyType={'done'}
            autoCapitalize={'none'}
            autoFocus={true}
          />
          {value && (
            <IconButton
              icon={'close-circle'}
              iconColor={theme.colors.outlineVariant}
              onPress={() => onChange('')}
              size={18}
            />
          )}
        </View>
      </Pressable>
    );
  }
);
