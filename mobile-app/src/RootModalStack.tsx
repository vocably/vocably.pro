import { useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Platform } from 'react-native';
import { Button, IconButton, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChatWithCardModal } from './ChatWithCard/ChatWithCardModal';
import { EditCardScreen } from './EditCardScreen';
import { FeedbackModal } from './FeedbackModal';
import { LanguageSelectorModal } from './LanguageSelectorModal';
import { PaymentSuccessModal } from './PaymentSuccessModal';
import { PreviewStudyStepModal } from './Settings/PreviewStudyStepModal';
import { StudySettingsScreen } from './Settings/StudySettingsScreen';
import { StudyScreen } from './study/StudyScreen';
import { TabsNavigator } from './TabsNavigator';
import { WelcomeScreen } from './Welcome/WelcomeScreen';

const Stack = createStackNavigator();

export const RootModalStack = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <Stack.Navigator>
      <Stack.Group screenOptions={{ headerShown: false }}>
        <Stack.Screen name="TabsNavigator" component={TabsNavigator} />
      </Stack.Group>
      <Stack.Group
        screenOptions={{
          presentation: 'modal',
          headerShown: false,
          animation: Platform.OS === 'android' ? 'fade' : undefined,
          detachInactiveScreens: false,
          statusBarTranslucent: true,
        }}
      >
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{
            presentation: 'transparentModal',
            headerShown: false,
            gestureEnabled: false,
            cardStyle: {
              backgroundColor: theme.colors.background,
            },
          }}
        />
        <Stack.Screen
          name="Study"
          component={StudyScreen}
          options={{
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="EditCardModal"
          component={EditCardScreen}
          options={{
            headerShown: true,
            headerTitle: 'Edit card',
            headerStyle: {
              minHeight: 48,
            },
            headerTitleStyle: {
              fontSize: 20,
              color: theme.colors.onBackground,
            },
            headerTitleAlign: 'left',
            headerLeft: () => (
              <IconButton
                icon={'close'}
                onPress={() => navigation.goBack()}
                style={{
                  marginLeft: 8,
                }}
              />
            ),
          }}
        />
        <Stack.Screen name="ChatWithCardModal" component={ChatWithCardModal} />
        <Stack.Screen
          name="PaymentSuccessModal"
          component={PaymentSuccessModal}
        />
        <Stack.Screen
          name="LanguageSelector"
          component={LanguageSelectorModal}
        />
        <Stack.Screen
          name={'Feedback'}
          component={FeedbackModal}
          options={{ headerShown: false, presentation: 'modal' }}
        />
        <Stack.Screen
          name="PreviewStudyStepModal"
          component={PreviewStudyStepModal}
        />
        <Stack.Screen
          name="StudySettingsModal"
          component={StudySettingsScreen}
          options={{
            headerShown: true,
            presentation: 'modal',
            title: 'Study settings',
            headerStyle: {},
            headerTitleStyle: {
              fontSize: 18,
              marginLeft: 8,
              color: theme.colors.onBackground,
            },
            headerTitleAlign: 'left',
            headerLeft: () => <></>,
            headerRight: () => (
              <Button
                textColor={theme.colors.onBackground}
                onPress={() => navigation.goBack()}
                buttonColor={theme.colors.background}
                style={{
                  marginRight: 8,
                }}
              >
                Done
              </Button>
            ),
          }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
};
