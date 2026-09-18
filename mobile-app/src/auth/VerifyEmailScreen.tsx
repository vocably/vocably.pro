import { Route, useNavigation } from '@react-navigation/native';
import { AuthErrorCode, getAuthErrorCode } from '@vocably/sulna';
import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';
import { Button } from 'react-native-paper';
import { FormText } from '../ui/FormText';
import { AuthErrorText, AuthNotice, AuthScrollView } from './AuthFormParts';
import { confirmEmail, resendEmailConfirmationCode } from './emailAuth';
import { popToLoginScreen } from './popToLoginScreen';
import { useResendCooldown } from './useResendCooldown';

type Props = {
  route: Route<string, { email: string }>;
};

export const VerifyEmailScreen: FC<Props> = ({ route }) => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { email } = route.params;

  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isResent, setIsResent] = useState(false);
  const [error, setError] = useState<AuthErrorCode | null>(null);
  const cooldown = useResendCooldown();

  useEffect(() => {
    // A code has just been sent by sign up or by sign in.
    cooldown.start();
  }, []);

  const canSubmit = /^\d{6}$/.test(code.trim());

  const submit = async () => {
    if (!canSubmit || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setIsResent(false);

    try {
      const step = await confirmEmail(email, code);

      if (step === 'signIn') {
        Alert.alert('', t('loginForm.emailConfirmed'));
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
      await resendEmailConfirmationCode(email);
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
      <AuthNotice>{t('verifyEmail.intro', { email })}</AuthNotice>
      {isResent && <AuthNotice>{t('verifyEmail.resent')}</AuthNotice>}
      <AuthErrorText code={error} />

      <FormText
        label={t('verifyEmail.code')}
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={6}
        returnKeyType="go"
        onSubmitEditing={submit}
      />
      <Button
        mode="contained"
        onPress={submit}
        loading={isSubmitting}
        disabled={!canSubmit || isSubmitting}
      >
        {t('verifyEmail.submit')}
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
      <Button mode="text" onPress={() => navigation.goBack()}>
        {t('verifyEmail.changeEmail')}
      </Button>
    </AuthScrollView>
  );
};
