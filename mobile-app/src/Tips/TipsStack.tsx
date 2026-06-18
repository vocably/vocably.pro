import { FC } from 'react';

import { createStackNavigator } from '@react-navigation/stack';
import { Header } from '../Header';
import { HowToEditCardsScreen } from './HowToEditCardsScreen';
import { HowToGroupCardsScreen } from './HowToGroupCardsScreen';
import { HowToImportAndExportScreen } from './HowToImportAndExportScreen';
import { HowToViewStudyStatisticsScreen } from './HowToViewStudyStatisticsScreen';
import { TipsScreen } from './TipsScreen';
import { useTranslation } from 'react-i18next';

const Stack = createStackNavigator();

export const TipsStack: FC = () => {
  const { t } = useTranslation();
  return (
    <Stack.Navigator
      screenOptions={{
        gestureEnabled: false,
        header: Header,
      }}
    >
      <Stack.Screen
        name="MainMenu"
        options={{
          title: t('nav.tips'),
        }}
        component={TipsScreen}
      />

      <Stack.Screen
        name="HowToEditCards"
        options={{}}
        component={HowToEditCardsScreen}
      />
      <Stack.Screen
        name="HowToGroupCards"
        options={{}}
        component={HowToGroupCardsScreen}
      />
      <Stack.Screen
        name="HowToImportAndExport"
        options={{}}
        component={HowToImportAndExportScreen}
      />
      <Stack.Screen
        name="HowToViewStudyStatistics"
        options={{}}
        component={HowToViewStudyStatisticsScreen}
      />
    </Stack.Navigator>
  );
};
