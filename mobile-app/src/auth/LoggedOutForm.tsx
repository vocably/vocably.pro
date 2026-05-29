import { signOut } from '@aws-amplify/auth';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mainPadding } from '../styles';
import { signIn } from './logInFunctions';

type Props = {
  onSignOut?: () => void;
};

export const LoggedOutForm: FC<Props> = ({ onSignOut = () => {} }) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
        paddingLeft: insets.left + mainPadding,
        paddingRight: insets.right + mainPadding,
      }}
    >
      <Text variant="bodyLarge" style={{ textAlign: 'center' }}>
        {t('auth.sessionExpired')}
      </Text>
      <Button
        mode="contained"
        onPress={signIn}
        style={{ alignSelf: 'stretch' }}
      >
        {t('auth.signInAgain')}
      </Button>
      <Button
        mode="outlined"
        style={{ alignSelf: 'stretch' }}
        onPress={async () => {
          await signOut();
          onSignOut();
        }}
      >
        {t('settings.signOut')}
      </Button>
    </ScrollView>
  );
};
