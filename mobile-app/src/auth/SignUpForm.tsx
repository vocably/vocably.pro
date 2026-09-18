import { useNavigation } from '@react-navigation/native';
import {
  AuthErrorCode,
  getAuthErrorCode,
  isPasswordValid,
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
import { signUpWithEmail } from './emailAuth';
import { PasswordRequirements } from './PasswordRequirements';
import { popToLoginScreen } from './popToLoginScreen';
import { SocialSignInButtons } from './SocialSignInButtons';

type Props = {
  initialEmail?: string;
  loading?: boolean;
  onSignIn?: (email: string) => void;
};

export const SignUpForm: FC<Props> = ({
  initialEmail = '',
  loading = false,
  onSignIn,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [isEmailTouched, setIsEmailTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Email/password errors are shown under the password field, while social
  // sign-in errors and unrecognized ones are shown under the social buttons.
  const [emailError, setEmailError] = useState<AuthErrorCode | null>(null);
  const [socialError, setSocialError] = useState<AuthErrorCode | null>(null);

  const canSubmit = isValidEmail(email) && isPasswordValid(password);

  const submit = async () => {
    if (!canSubmit || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setEmailError(null);
    setSocialError(null);

    try {
      const step = await signUpWithEmail(email, password);

      if (step === 'confirmSignUp') {
        navigation.navigate('verifyEmail', { email: normalizeEmail(email) });
      }

      if (step === 'done') {
        popToLoginScreen(navigation);
      }
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
      <AuthErrorText code={emailError} />
      <Button
        mode="contained"
        onPress={submit}
        loading={isSubmitting || loading}
        disabled={!canSubmit || isSubmitting || loading}
      >
        {t('signUp.submit')}
      </Button>

      <Text style={{ textAlign: 'center' }}>
        {t('signUp.haveAccount')}{' '}
        <Text
          style={{ color: theme.colors.primary }}
          onPress={() =>
            onSignIn
              ? onSignIn(normalizeEmail(email))
              : popToLoginScreen(navigation)
          }
        >
          {t('signUp.signIn')}
        </Text>
      </Text>

      <TermsNotice agreeKey="signUp.byCreatingAccountYouAgreeToOur" />
    </View>
  );
};
