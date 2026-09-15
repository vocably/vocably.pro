import { useNavigation } from '@react-navigation/native';
import {
  AuthErrorCode,
  getAuthErrorCode,
  isValidEmail,
  normalizeEmail,
} from '@vocably/sulna';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { FormText } from '../ui/FormText';
import {
  AuthErrorText,
  emailInputProps,
  OrDivider,
  PasswordInput,
  TermsNotice,
} from './AuthFormParts';
import { signInWithEmail } from './emailAuth';
import { emailPasswordAuthEnabled } from './emailPasswordAuthEnabled';
import { SocialSignInButtons } from './SocialSignInButtons';

type Props = {
  loading?: boolean;
};

export const LoginForm: FC<Props> = ({ loading = false }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Email/password errors are shown under the password field, while social
  // sign-in errors and unrecognized ones are shown under the social buttons.
  const [emailError, setEmailError] = useState<AuthErrorCode | null>(null);
  const [socialError, setSocialError] = useState<AuthErrorCode | null>(null);

  const canSubmit = isValidEmail(email) && password.length > 0;

  const submit = async () => {
    if (!canSubmit || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setEmailError(null);
    setSocialError(null);

    try {
      const step = await signInWithEmail(email, password);

      if (step === 'confirmSignUp') {
        navigation.navigate('verifyEmail', { email: normalizeEmail(email) });
      }
      // On `done` AuthContainer takes over through the `signedIn` Hub event.
    } catch (e) {
      const code = getAuthErrorCode(e);

      if (code === 'unknown') {
        setSocialError(code);
      } else {
        setEmailError(code);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={{ alignSelf: 'stretch', gap: 16 }}>
      <SocialSignInButtons
        disabled={loading || isSubmitting}
        onError={(code) => {
          setEmailError(null);
          setSocialError(code);
        }}
      />
      <AuthErrorText code={socialError} />

      {emailPasswordAuthEnabled && (
        <>
          <OrDivider />
          <FormText
            {...emailInputProps}
            label={t('loginForm.email')}
            value={email}
            onChangeText={setEmail}
            returnKeyType="next"
          />
          <PasswordInput
            label={t('loginForm.password')}
            value={password}
            onChangeText={setPassword}
            textContentType="password"
            autoComplete="current-password"
            returnKeyType="go"
            onSubmitEditing={submit}
          />
          <AuthErrorText code={emailError} />
          <Button
            mode="contained"
            onPress={submit}
            loading={isSubmitting || loading}
            disabled={!canSubmit || isSubmitting || loading}
          >
            {t('loginForm.submit')}
          </Button>
          <Button
            mode="text"
            onPress={() =>
              navigation.navigate('forgotPassword', {
                email: normalizeEmail(email),
              })
            }
          >
            {t('loginForm.forgotPassword')}
          </Button>
          <Text style={{ textAlign: 'center' }}>
            {t('loginForm.noAccount')}{' '}
            <Text
              style={{ color: theme.colors.primary }}
              onPress={() =>
                navigation.navigate('signUp', { email: normalizeEmail(email) })
              }
            >
              {t('loginForm.createAccount')}
            </Text>
          </Text>
        </>
      )}

      <TermsNotice agreeKey="loginForm.bySigningInYouAgreeToOur" />
    </View>
  );
};
