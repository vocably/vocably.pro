import { AuthErrorCode, getAuthErrorCode } from '@vocably/sulna';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Button } from 'react-native-paper';
import { signInWithProvider, SocialProvider } from './logInFunctions';

type Props = {
  disabled?: boolean;
  onError: (code: AuthErrorCode | null) => void;
};

export const SocialSignInButtons: FC<Props> = ({
  disabled = false,
  onError,
}) => {
  const { t } = useTranslation();
  const [signingInWith, setSigningInWith] = useState<SocialProvider | null>(
    null
  );

  const signIn = async (provider: SocialProvider) => {
    setSigningInWith(provider);
    onError(null);

    try {
      // Resolves once the in-app browser is closed. AuthContainer picks up a
      // successful sign-in through the `signedIn` Hub event.
      await signInWithProvider(provider);
    } catch (error) {
      const code = getAuthErrorCode(error);

      if (code !== 'cancelled') {
        onError(code);
      }
    } finally {
      setSigningInWith(null);
    }
  };

  const isDisabled = disabled || signingInWith !== null;

  return (
    <View style={{ gap: 12 }}>
      <Button
        mode="outlined"
        icon="google"
        loading={signingInWith === 'Google'}
        disabled={isDisabled}
        onPress={() => signIn('Google')}
      >
        {t('loginForm.continueWithGoogle')}
      </Button>
      <Button
        mode="outlined"
        icon="apple"
        loading={signingInWith === 'Apple'}
        disabled={isDisabled}
        onPress={() => signIn('Apple')}
      >
        {t('loginForm.continueWithApple')}
      </Button>
    </View>
  );
};
