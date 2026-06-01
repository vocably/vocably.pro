import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationProp } from '@react-navigation/native';
import { FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { DeckStack } from './DeckStack';
import { LookUpScreen } from './LookUpScreen';
import { SettingsStack } from './Settings/SettingsStack';
import { TipsStack } from './Tips/TipsStack';
import { useWelcomeRequired } from './useWelcomeRequired';
import { usePostHog } from 'posthog-react-native';
import { getAll } from './asyncAppStorage';

const Tabs = createBottomTabNavigator();

type Props = {
  navigation: NavigationProp<any>;
};

export const TabsNavigator: FC<Props> = ({ navigation }) => {
  const welcomeIsRequiredResult = useWelcomeRequired();
  const theme = useTheme();
  const posthog = usePostHog();
  const { t } = useTranslation();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (
      welcomeIsRequiredResult.status === 'loaded' &&
      welcomeIsRequiredResult.value
    ) {
      timer = setTimeout(async () => {
        navigation.navigate('Welcome');
        posthog.capture(
          'showingWelcomeScreen',
          Object.fromEntries(
            Object.entries(await getAll()).filter(
              ([key]) =>
                !key.endsWith('posthog-rn.json') && !key.endsWith('auth')
            )
          )
        );
      }, 400);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [welcomeIsRequiredResult]);

  if (
    welcomeIsRequiredResult.status !== 'loaded' ||
    welcomeIsRequiredResult.value
  ) {
    return <></>;
  }

  return (
    <>
      <Tabs.Navigator
        screenOptions={{
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.onSurface,
          tabBarStyle: {
            elevation: 10, // Android
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -1 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            borderTopWidth: 0,
            backgroundColor: theme.colors.elevation.level1,
          },
        }}
      >
        <Tabs.Screen
          name="DeckScreen"
          options={{
            headerShown: false,
            title: t('nav.myCards'),
            tabBarIcon: ({ color }) => (
              <Icon name="card-multiple-outline" color={color} size={24} />
            ),
          }}
          component={DeckStack}
        />
        <Tabs.Screen
          name="LookUp"
          component={LookUpScreen}
          options={{
            headerShown: false,
            title: t('nav.lookUp'),
            tabBarIcon: ({ color }) => (
              <Icon name="translate" color={color} size={24} />
            ),
          }}
        />
        <Tabs.Screen
          name="Tips"
          component={TipsStack}
          options={{
            headerShown: false,
            title: t('nav.tips'),
            tabBarIcon: ({ color }) => (
              <Icon name="information-outline" color={color} size={24} />
            ),
          }}
        />
        <Tabs.Screen
          name="Settings"
          component={SettingsStack}
          options={{
            title: t('nav.settings'),
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <Icon name="tune-variant" color={color} size={24} />
            ),
          }}
        />
      </Tabs.Navigator>
    </>
  );
};
