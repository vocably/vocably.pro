import { Route, useNavigation } from '@react-navigation/native';
import {
  AuthErrorCode,
  getAuthErrorCode,
  isPasswordValid,
} from '@vocably/sulna';
import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'react-native-paper';
import { FormText } from '../ui/FormText';
import {
  AuthErrorText,
  AuthNotice,
  AuthScrollView,
  PasswordInput,
} from './AuthFormParts';
import { confirmPasswordReset, requestPasswordReset } from './emailAuth';
import { PasswordRequirements } from './PasswordRequirements';
import { popToLoginScreen } from './popToLoginScreen';
import { useResendCooldown } from './useResendCooldown';

type Props = {
  route: Route<string, { email: string }>;
};

export const ResetPasswordScreen: FC<Props> = ({ route }) => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { email } = route.params;

  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isResent, setIsResent] = useState(false);
  const [error, setError] = useState<AuthErrorCode | null>(null);
  const cooldown = useResendCooldown();

  useEffect(() => {
    cooldown.start();
  }, []);

  const canSubmit = /^\d{6}$/.test(code.trim()) && isPasswordValid(password);

  const submit = async () => {
    if (!canSubmit || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setIsResent(false);

    try {
      const step = await confirmPasswordReset(email, code, password);

      if (step === 'confirmSignUp') {
        navigation.replace('verifyEmail', { email });
        return;
      }

      popToLoginScreen(navigation);
    } catch (e) {
      setError(getAuthErrorCode(e));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resend = async () => {
    if (cooldown.remaining > 0 || isResending) {
      return;
    }

    setIsResending(true);
    setError(null);
    setIsResent(false);

    try {
      await requestPasswordReset(email);
      setIsResent(true);
      cooldown.start();
    } catch (e) {
      setError(getAuthErrorCode(e));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthScrollView>
      <AuthNotice>{t('resetPassword.intro', { email })}</AuthNotice>
      {isResent && <AuthNotice>{t('verifyEmail.resent')}</AuthNotice>}
      <AuthErrorText code={error} />

      <FormText
        label={t('resetPassword.code')}
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={6}
        returnKeyType="next"
      />
      <PasswordInput
        label={t('resetPassword.newPassword')}
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
        {t('resetPassword.submit')}
      </Button>
      <Button
        mode="outlined"
        onPress={resend}
        loading={isResending}
        disabled={cooldown.remaining > 0 || isResending}
      >
        {cooldown.remaining > 0
          ? t('verifyEmail.resendIn', { seconds: cooldown.remaining })
          : t('verifyEmail.resend')}
      </Button>
      <Button mode="text" onPress={() => popToLoginScreen(navigation)}>
        {t('forgotPassword.backToSignIn')}
      </Button>
    </AuthScrollView>
  );
};
