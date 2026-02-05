import { FC } from 'react';

import { createStackNavigator } from '@react-navigation/stack';
import { View } from 'react-native';
import { MainMenuHeader } from './MainMenuHeader';
import { SettingsScreen } from './SettingsScreen';
import { StudySettingsScreen } from './StudySettingsScreen';

const Stack = createStackNavigator();

export const SettingsStack: FC = () => {
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
        }}
      >
        <Stack.Screen
          name="MainMenu"
          options={{
            headerShown: false,
          }}
          component={SettingsScreen}
        />
        <Stack.Screen
          options={{
            header: MainMenuHeader,
            title: 'Study settings',
          }}
          name="StudySettings"
          component={StudySettingsScreen}
        />
      </Stack.Navigator>
    </View>
  );
};
