import { FC } from 'react';

import { createStackNavigator } from '@react-navigation/stack';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppLanguageScreen } from './AppLanguageScreen';
import { SettingsScreen } from './SettingsScreen';
import { StudySettingsScreen } from './StudySettingsScreen';
import { Header } from '../Header';

const Stack = createStackNavigator();

export const SettingsStack: FC = () => {
  const { t } = useTranslation();
  return (
    <View
      style={{
        flex: 1,
        overflow: 'hidden',
      }}
    >
      <Stack.Navigator
        screenOptions={{
          gestureEnabled: false,
          header: Header,
        }}
      >
        <Stack.Screen
          name="MainMenu"
          options={{
            title: t('nav.settings'),
          }}
          component={SettingsScreen}
        />
        <Stack.Screen
          options={{
            title: t('nav.studySettings'),
          }}
          name="StudySettings"
          component={StudySettingsScreen}
        />
        <Stack.Screen
          options={{
            title: t('appLanguagePicker.title'),
          }}
          name="AppLanguage"
          component={AppLanguageScreen}
        />
      </Stack.Navigator>
    </View>
  );
};
