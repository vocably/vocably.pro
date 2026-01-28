import { useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { FC } from 'react';
import { Platform } from 'react-native';
import { Appbar, Button, useTheme } from 'react-native-paper';
import { LanguageSelectorModal } from '../LanguageSelectorModal';
import { LanguageScreen } from './LanguageScreen';
import { LoginScreen } from './LoginScreen';
import { SurveyScreen } from './SurveyScreen';

const Stack = createStackNavigator();

type Props = {};

export const AuthNavigation: FC<Props> = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  return (
    <Stack.Navigator
      screenOptions={{
        headerLeft: () => {
          if (!navigation.canGoBack()) {
            return <></>;
          }
          return (
            <Appbar.BackAction
              onPress={navigation.goBack}
              size={18}
              style={{ backgroundColor: 'transparent' }}
            />
          );
        },
        headerRight: () => (
          <Button
            style={{ marginRight: 16 }}
            onPress={() => navigation.navigate('login')}
          >
            Sign in
          </Button>
        ),
      }}
    >
      <Stack.Screen
        name="language"
        component={LanguageScreen}
        options={{
          title: '',
        }}
      />
      <Stack.Screen
        name="login"
        component={LoginScreen}
        options={{
          title: 'Sign in or Register',
          headerRight: () => <></>,
        }}
      />
      <Stack.Screen
        name="survey"
        component={SurveyScreen}
        options={{
          title: '',
        }}
      />
      <Stack.Group
        screenOptions={{
          presentation: 'modal',
          headerShown: false,
          animation: Platform.OS === 'android' ? 'fade' : undefined,
          detachInactiveScreens: false,
          statusBarTranslucent: true,
          headerTitleStyle: {
            fontSize: 18,
            color: theme.colors.onBackground,
          },
          headerTitleAlign: 'left',
          headerRightContainerStyle: {},
          headerLeft: () => (
            <Appbar.BackAction
              onPress={navigation.goBack}
              size={18}
              style={{ backgroundColor: 'transparent' }}
            />
          ),
          headerRight: () => <></>,
        }}
      >
        <Stack.Screen
          name="LanguageSelector"
          component={LanguageSelectorModal}
          options={{
            headerShown: true,
          }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
};
