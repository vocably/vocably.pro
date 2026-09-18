import { createStackNavigator } from '@react-navigation/stack';
import { i18n } from '../i18n';
import { ForgotPasswordScreen } from './ForgotPasswordScreen';
import { ResetPasswordScreen } from './ResetPasswordScreen';
import { SignUpScreen } from './SignUpScreen';
import { VerifyEmailScreen } from './VerifyEmailScreen';

type Stack = ReturnType<typeof createStackNavigator>;

/**
 * Registered in both AuthNavigation (logged out) and RootModalStack
 * (anonymous user creating an account from Settings), so the screens can
 * navigate between each other by name in either stack.
 */
export const renderAuthScreens = (Stack: Stack) => (
  <>
    <Stack.Screen
      name="signUp"
      component={SignUpScreen}
      options={{
        headerShown: true,
        title: i18n.t('signUp.screenTitle'),
        headerRight: () => <></>,
      }}
    />
    <Stack.Screen
      name="verifyEmail"
      component={VerifyEmailScreen}
      options={{
        headerShown: true,
        title: i18n.t('verifyEmail.screenTitle'),
        headerRight: () => <></>,
      }}
    />
    <Stack.Screen
      name="forgotPassword"
      component={ForgotPasswordScreen}
      options={{
        headerShown: true,
        title: i18n.t('forgotPassword.screenTitle'),
        headerRight: () => <></>,
      }}
    />
    <Stack.Screen
      name="resetPassword"
      component={ResetPasswordScreen}
      options={{
        headerShown: true,
        title: i18n.t('resetPassword.screenTitle'),
        headerRight: () => <></>,
      }}
    />
  </>
);
