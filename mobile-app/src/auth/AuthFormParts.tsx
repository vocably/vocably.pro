import { AuthErrorCode } from '@vocably/sulna';
import { ComponentProps, FC, PropsWithChildren, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import { IconButton, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mainPadding } from '../styles';
import { FormText } from '../ui/FormText';

export const emailInputProps = {
  autoCapitalize: 'none',
  autoCorrect: false,
  keyboardType: 'email-address',
  autoComplete: 'email',
  // Pairs the address with the password in password managers.
  textContentType: 'username',
} as const;

export const AuthScrollView: FC<PropsWithChildren> = ({ children }) => {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets={true}
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        gap: 16,
        paddingTop: mainPadding,
        paddingBottom: insets.bottom + mainPadding,
        paddingLeft: insets.left + mainPadding,
        paddingRight: insets.right + mainPadding,
      }}
    >
      {children}
    </ScrollView>
  );
};

export const PasswordInput: FC<ComponentProps<typeof FormText>> = (props) => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  return (
    <FormText
      autoCapitalize="none"
      autoCorrect={false}
      {...props}
      secureTextEntry={!isVisible}
      right={
        <IconButton
          icon={isVisible ? 'eye-off-outline' : 'eye-outline'}
          onPress={() => setIsVisible(!isVisible)}
          accessibilityLabel={t(
            isVisible ? 'loginForm.hidePassword' : 'loginForm.showPassword'
          )}
          style={{
            alignSelf: 'center',
            margin: 0,
            backgroundColor: 'transparent',
          }}
        />
      }
    />
  );
};

export const OrDivider: FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  const line = {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.outlineVariant,
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={line} />
      <Text style={{ color: theme.colors.onSurfaceVariant }}>
        {t('loginForm.or')}
      </Text>
      <View style={line} />
    </View>
  );
};

export const AuthErrorText: FC<{ code: AuthErrorCode | null }> = ({ code }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  if (!code) {
    return null;
  }

  return (
    <Text
      accessibilityRole="alert"
      style={{ color: theme.colors.error, textAlign: 'center' }}
    >
      {t(`authErrors.${code}`)}
    </Text>
  );
};

export const AuthNotice: FC<PropsWithChildren> = ({ children }) => (
  <Text style={{ textAlign: 'center' }}>{children}</Text>
);

export const TermsNotice: FC<{ agreeKey: string }> = ({ agreeKey }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Text style={{ textAlign: 'center' }}>
      {t(agreeKey)}{' '}
      <Text
        style={{ color: theme.colors.primary }}
        onPress={() =>
          Linking.openURL('https://vocably.pro/terms-and-conditions.html')
        }
      >
        {t('loginForm.termsAndConditions')}
      </Text>{' '}
      {t('loginForm.and')}{' '}
      <Text
        style={{ color: theme.colors.primary }}
        onPress={() =>
          Linking.openURL('https://vocably.pro/privacy-policy.html')
        }
      >
        {t('loginForm.privacyPolicy')}
      </Text>
      .
    </Text>
  );
};
