import { Route, useNavigation } from '@react-navigation/native';
import {
  AuthErrorCode,
  getAuthErrorCode,
  isValidEmail,
  normalizeEmail,
} from '@vocably/sulna';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'react-native-paper';
import { FormText } from '../ui/FormText';
import {
  AuthErrorText,
  AuthNotice,
  AuthScrollView,
  emailInputProps,
} from './AuthFormParts';
import { requestPasswordReset } from './emailAuth';
import { popToLoginScreen } from './popToLoginScreen';

type Props = {
  route: Route<string, { email?: string } | undefined>;
};

export const ForgotPasswordScreen: FC<Props> = ({ route }) => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const [email, setEmail] = useState(route.params?.email ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<AuthErrorCode | null>(null);

  const canSubmit = isValidEmail(email);

  const submit = async () => {
    if (!canSubmit || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Succeeds for unknown addresses too: the app client hides whether an
      // account exists.
      await requestPasswordReset(email);
      navigation.navigate('resetPassword', { email: normalizeEmail(email) });
    } catch (e) {
      setError(getAuthErrorCode(e));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthScrollView>
      <AuthNotice>{t('forgotPassword.intro')}</AuthNotice>
      <AuthErrorText code={error} />

      <FormText
        {...emailInputProps}
        label={t('loginForm.email')}
        value={email}
        onChangeText={setEmail}
        returnKeyType="go"
        onSubmitEditing={submit}
      />
      <Button
        mode="contained"
        onPress={submit}
        loading={isSubmitting}
        disabled={!canSubmit || isSubmitting}
      >
        {t('forgotPassword.submit')}
      </Button>
      <Button mode="text" onPress={() => popToLoginScreen(navigation)}>
        {t('forgotPassword.backToSignIn')}
      </Button>
    </AuthScrollView>
  );
};
