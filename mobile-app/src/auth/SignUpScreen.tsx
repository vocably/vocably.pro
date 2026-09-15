import { Route, useNavigation } from '@react-navigation/native';
import {
  AuthErrorCode,
  getAuthErrorCode,
  isPasswordValid,
  isValidEmail,
  normalizeEmail,
} from '@vocably/sulna';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Text, useTheme } from 'react-native-paper';
import { FormText } from '../ui/FormText';
import {
  AuthErrorText,
  AuthScrollView,
  emailInputProps,
  OrDivider,
  PasswordInput,
  TermsNotice,
} from './AuthFormParts';
import { signUpWithEmail } from './emailAuth';
import { emailPasswordAuthEnabled } from './emailPasswordAuthEnabled';
import { PasswordRequirements } from './PasswordRequirements';
import { popToLoginScreen } from './popToLoginScreen';
import { SocialSignInButtons } from './SocialSignInButtons';

type Props = {
  route: Route<string, { email?: string } | undefined>;
};

export const SignUpScreen: FC<Props> = ({ route }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const [email, setEmail] = useState(route.params?.email ?? '');
  const [password, setPassword] = useState('');
  const [isEmailTouched, setIsEmailTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<AuthErrorCode | null>(null);

  const canSubmit = isValidEmail(email) && isPasswordValid(password);

  const submit = async () => {
    if (!canSubmit || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const step = await signUpWithEmail(email, password);

      if (step === 'confirmSignUp') {
        navigation.navigate('verifyEmail', { email: normalizeEmail(email) });
      }

      if (step === 'done') {
        popToLoginScreen(navigation);
      }
    } catch (e) {
      setError(getAuthErrorCode(e));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthScrollView>
      <AuthErrorText code={error} />

      <SocialSignInButtons disabled={isSubmitting} onError={setError} />

      {emailPasswordAuthEnabled && (
        <>
          <OrDivider />
          <FormText
            {...emailInputProps}
            label={t('loginForm.email')}
            value={email}
            onChangeText={setEmail}
            onBlur={() => setIsEmailTouched(true)}
            returnKeyType="next"
          />
          {isEmailTouched && !isValidEmail(email) && (
            <Text style={{ color: theme.colors.error }}>
              {t('authErrors.invalidEmail')}
            </Text>
          )}
          <PasswordInput
            label={t('loginForm.password')}
            value={password}
            onChangeText={setPassword}
            textContentType="newPassword"
            autoComplete="new-password"
            returnKeyType="go"
            onSubmitEditing={submit}
          />
          <PasswordRequirements password={password} />
          <Button
            mode="contained"
            onPress={submit}
            loading={isSubmitting}
            disabled={!canSubmit || isSubmitting}
          >
            {t('signUp.submit')}
          </Button>
        </>
      )}

      <Text style={{ textAlign: 'center' }}>
        {t('signUp.haveAccount')}{' '}
        <Text
          style={{ color: theme.colors.primary }}
          onPress={() => popToLoginScreen(navigation)}
        >
          {t('signUp.signIn')}
        </Text>
      </Text>

      <TermsNotice agreeKey="signUp.byCreatingAccountYouAgreeToOur" />
    </AuthScrollView>
  );
};
