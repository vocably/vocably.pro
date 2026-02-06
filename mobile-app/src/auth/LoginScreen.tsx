import React, { FC } from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mainPadding } from '../styles';
import { LoginForm } from './LoginForm';

type Props = {};

export const LoginScreen: FC<Props> = () => {
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
      <LoginForm />
    </ScrollView>
  );
};
