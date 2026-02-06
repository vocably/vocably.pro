import { signOut } from '@aws-amplify/auth';
import React, { FC } from 'react';
import { Platform, ScrollView } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mainPadding } from '../styles';
import { signIn, signInWithAnIdioticCognitoFlow } from './logInFunctions';

type Props = {};

export const LoggedOutForm: FC<Props> = () => {
  const theme = useTheme();
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
        Your authentication session is expired.
      </Text>
      <Button
        mode="contained"
        onPress={signIn}
        style={{ alignSelf: 'stretch' }}
      >
        Sign in again
      </Button>
      {Platform.OS === 'ios' && (
        <Button
          mode="outlined"
          onPress={() => signInWithAnIdioticCognitoFlow()}
          style={{ alignSelf: 'stretch' }}
        >
          Sign in with another Google Account
        </Button>
      )}
      <Button
        mode="outlined"
        style={{ alignSelf: 'stretch' }}
        onPress={() => signOut()}
      >
        Sign out
      </Button>
    </ScrollView>
  );
};
