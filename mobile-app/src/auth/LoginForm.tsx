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
  const [error, setError] = useState<AuthErrorCode | null>(null);

  const canSubmit = isValidEmail(email) && password.length > 0;

  const submit = async () => {
    if (!canSubmit || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const step = await signInWithEmail(email, password);

      if (step === 'confirmSignUp') {
        navigation.navigate('verifyEmail', { email: normalizeEmail(email) });
      }
      // On `done` AuthContainer takes over through the `signedIn` Hub event.
    } catch (e) {
      setError(getAuthErrorCode(e));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={{ alignSelf: 'stretch', gap: 16 }}>
      <AuthErrorText code={error} />

      <SocialSignInButtons
        disabled={loading || isSubmitting}
        onError={setError}
      />

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
