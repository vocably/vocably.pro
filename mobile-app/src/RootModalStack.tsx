import { useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Appbar, useTheme } from 'react-native-paper';
import { LoginModal } from './auth/LoginModal';
import { ChatWithCardModal } from './ChatWithCard/ChatWithCardModal';
import { EditCardScreen } from './EditCardScreen';
import { ExportDeckModal } from './ExportDeckModal';
import { FeedbackModal } from './FeedbackModal';
import { GenerateCardsModal } from './GenerateCards/GenerateCardsModal';
import { LanguageSelectorModal } from './LanguageSelectorModal';
import { PaymentSuccessModal } from './PaymentSuccessModal';
import { PreviewStudyStepModal } from './Settings/PreviewStudyStepModal';
import { StudySettingsScreen } from './Settings/StudySettingsScreen';
import { StudyScreen } from './study/StudyScreen';
import { TabsNavigator } from './TabsNavigator';
import { WelcomeScreen } from './Welcome/WelcomeScreen';
import { LookUpModal } from './LookUpModal';

const Stack = createStackNavigator();

export const RootModalStack = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { t } = useTranslation();

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
            headerTitle: t('nav.editCard'),
          }}
        />
        <Stack.Screen
          name="ChatWithCardModal"
          component={ChatWithCardModal}
          options={{
            headerShown: true,
            headerTitle: t('nav.chatWithCard'),
          }}
        />
        <Stack.Screen
          name={'GenerateCards'}
          component={GenerateCardsModal}
          options={{ headerShown: true, title: t('nav.cardGenerator') }}
        />
        <Stack.Screen
          name="PaymentSuccessModal"
          component={PaymentSuccessModal}
          options={{
            headerShown: true,
            headerTitle: '',
          }}
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
          options={{ headerShown: true, title: t('nav.feedback') }}
        />
        <Stack.Screen
          name="LoginModal"
          component={LoginModal}
          options={{
            headerShown: true,
            title: t('nav.createAccount'),
          }}
        />
        <Stack.Screen
          name="PreviewStudyStepModal"
          component={PreviewStudyStepModal}
          options={{
            headerShown: true,
            title: t('nav.previewStudyStep'),
          }}
        />
        <Stack.Screen
          name="StudySettingsModal"
          component={StudySettingsScreen}
          options={{
            headerShown: true,
            title: t('nav.studySettings'),
          }}
        />
        <Stack.Screen
          name="ExportDeckModal"
          component={ExportDeckModal}
          options={{
            headerShown: true,
            title: t('nav.exportDeck'),
          }}
        />
        <Stack.Screen
          name="LookUpModal"
          component={LookUpModal}
          options={{
            headerShown: false,
            title: '',
          }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
};
