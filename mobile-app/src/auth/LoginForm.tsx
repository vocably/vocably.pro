import { FC } from 'react';
import { Linking, Platform, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { signIn, signInWithAnIdioticCognitoFlow } from './logInFunctions';

type Props = {
  loading?: boolean;
};

export const LoginForm: FC<Props> = ({ loading = false }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
      }}
    >
      <Button
        mode="contained"
        onPress={signIn}
        style={{ alignSelf: 'stretch' }}
        loading={loading}
      >
        {t('loginForm.signIn')}
      </Button>
      <Text style={{ textAlign: 'center' }}>
        {t('loginForm.bySigningInYouAgreeToOur')}{' '}
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
    </View>
  );
};
