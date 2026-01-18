import { useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Platform } from 'react-native';
import { Appbar, useTheme } from 'react-native-paper';
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
          }}
        />
        <Stack.Screen
          name="ChatWithCardModal"
          component={ChatWithCardModal}
          options={{
            headerShown: true,
            headerTitle: 'Chat about the card',
          }}
        />
        <Stack.Screen
          name="PaymentSuccessModal"
          component={PaymentSuccessModal}
        />
        <Stack.Screen
          name="LanguageSelector"
          component={LanguageSelectorModal}
          options={{
            headerShown: true,
          }}
        />
        <Stack.Screen
          name={'Feedback'}
          component={FeedbackModal}
          options={{ headerShown: true, title: 'Feedback' }}
        />
        <Stack.Screen
          name="PreviewStudyStepModal"
          component={PreviewStudyStepModal}
          options={{
            headerShown: true,
            title: 'Preview study step',
          }}
        />
        <Stack.Screen
          name="StudySettingsModal"
          component={StudySettingsScreen}
          options={{
            headerShown: true,
            title: 'Study settings',
          }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
};
