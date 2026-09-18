import { Route } from '@react-navigation/native';
import { FC } from 'react';
import { AuthScrollView } from './AuthFormParts';
import { SignUpForm } from './SignUpForm';

type Props = {
  route: Route<string, { email?: string } | undefined>;
};

export const SignUpScreen: FC<Props> = ({ route }) => (
  <AuthScrollView>
    <SignUpForm initialEmail={route.params?.email} />
  </AuthScrollView>
);
