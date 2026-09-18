import React, { FC } from 'react';
import { AuthScrollView } from './AuthFormParts';
import { LoginForm } from './LoginForm';

type Props = {};

export const LoginScreen: FC<Props> = () => {
  return (
    <AuthScrollView>
      <LoginForm />
    </AuthScrollView>
  );
};
