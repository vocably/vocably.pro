import { createStackNavigator } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import { DashboardScreen } from './DashboardScreen';
import { NotificationsScreen } from './DeckStack/NotificationsScreen';
import { EditDeckScreen } from './EditDeckScreen';
import { Header } from './Header';
import { useCurrentLanguageName } from './useCurrentLanguageName';

const Stack = createStackNavigator();

export const DeckStack = () => {
  const languageName = useCurrentLanguageName();
  const { t } = useTranslation();
  return (
    <Stack.Navigator
      screenOptions={{
        header: Header,
      }}
    >
      <Stack.Screen
        name="Dashboard"
        options={{ title: languageName, headerShown: false }}
        component={DashboardScreen}
      />
      <Stack.Screen
        name="EditDeck"
        options={{ title: t('deck.editDeckTitle', { languageName }) }}
        component={EditDeckScreen}
      />
      <Stack.Screen
        name="Notifications"
        options={{
          title: t('deck.studyRemindersTitle', { languageName }),
        }}
        component={NotificationsScreen}
      />
    </Stack.Navigator>
  );
};
