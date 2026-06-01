import { useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { FC } from 'react';
import { Platform, useWindowDimensions } from 'react-native';
import { Appbar, Button, useTheme } from 'react-native-paper';
import { LanguageSelectorModal } from '../LanguageSelectorModal';
import { LanguageScreen } from './LanguageScreen';
import { LoginScreen } from './LoginScreen';
import { DiscoverySurveyScreen } from './DiscoverySurveyScreen';
import { Trans } from 'react-i18next';
import { i18n } from '../i18n';

const Stack = createStackNavigator();

type Props = {};

export const AuthNavigation: FC<Props> = () => {
  const theme = useTheme();
  const navigation = useNavigation();

  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleAllowFontScaling: false,
        headerStyle: {
          backgroundColor: theme.colors.background,
          borderWidth: 0,
        },
        headerTitleStyle: {
          color: theme.colors.secondary,
        },
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
            maxFontSizeMultiplier={1}
            compact={true}
          >
            <Trans i18nKey={'common.signIn'} />
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
        name="discovery"
        component={DiscoverySurveyScreen}
        options={{
          title: i18n.t('discoverySurvey.screenTitle'),
        }}
      />
      <Stack.Screen
        name="login"
        component={LoginScreen}
        options={{
          title: i18n.t('loginForm.screenTitle'),
          headerRight: () => <></>,
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
            headerTransparent: false,
          }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
};
