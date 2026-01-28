import React, { FC } from 'react';
import { Linking, Platform, ScrollView, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mainPadding } from '../styles';
import { signIn, signInWithAnIdioticCognitoFlow } from './signInfFunctions';

type Props = {};

export const LoginScreen: FC<Props> = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
      }}
    >
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          gap: 16,
          paddingLeft: insets.left + mainPadding,
          paddingRight: insets.right + mainPadding,
        }}
      >
        <Button
          mode="contained"
          onPress={signIn}
          style={{ alignSelf: 'stretch' }}
        >
          Sign in or Create an account
        </Button>
        <Text style={{ textAlign: 'center' }}>
          By signing in, you agree to our{' '}
          <Text
            style={{ color: theme.colors.primary }}
            onPress={() =>
              Linking.openURL('https://vocably.pro/terms-and-conditions.html')
            }
          >
            Terms and Conditions
          </Text>{' '}
          and{' '}
          <Text
            style={{ color: theme.colors.primary }}
            onPress={() =>
              Linking.openURL('https://vocably.pro/privacy-policy.html')
            }
          >
            Privacy Policy
          </Text>
          .
        </Text>
        {Platform.OS === 'ios' && (
          <Text
            onPress={() => signInWithAnIdioticCognitoFlow()}
            style={{
              color: theme.colors.primary,
            }}
          >
            I want to sign in with another Google Account.
          </Text>
        )}
      </View>
    </ScrollView>
  );
};
