import { API_BASE_URL, API_CARDS_BUCKET, API_REGION } from '@env';
import { configureApi } from '@vocably/api';
import { fetchAuthSession } from 'aws-amplify/auth';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthContainer } from './auth/AuthContainer';
import { Login } from './auth/Login';
import { configurePurchases } from './configurePurchases';
import { CustomerInfoContainer } from './CustomerInfoContainer';
import { LanguagesContainer } from './languages/LanguagesContainer';
import { NavigationContainer } from './NavigationContainer';
import { NotificationsContainer } from './NotificationsContainer';
import { PostHogProvider } from './PostHogProvider';
import { RootModalStack } from './RootModalStack';
import { ThemeProvider } from './ThemeProvider';
import { TranslationPresetContainer } from './TranslationPreset/TranslationPresetContainer';
import { UserMetadataContainer } from './UserMetadataContainer';

configureApi({
  baseUrl: API_BASE_URL,
  region: API_REGION,
  cardsBucket: API_CARDS_BUCKET,
  getJwtToken: () =>
    fetchAuthSession().then(
      (session) => session.tokens?.idToken?.toString() ?? ''
    ),
});

const App = () => {
  configurePurchases();
  return (
    <KeyboardProvider>
      <ThemeProvider>
        <NavigationContainer>
          <PostHogProvider>
            <AuthContainer>
              <Login>
                <CustomerInfoContainer>
                  <NotificationsContainer>
                    <UserMetadataContainer>
                      <LanguagesContainer refreshLanguagesOnActive={true}>
                        <TranslationPresetContainer>
                          <SafeAreaProvider>
                            <RootModalStack />
                          </SafeAreaProvider>
                        </TranslationPresetContainer>
                      </LanguagesContainer>
                    </UserMetadataContainer>
                  </NotificationsContainer>
                </CustomerInfoContainer>
              </Login>
            </AuthContainer>
          </PostHogProvider>
        </NavigationContainer>
      </ThemeProvider>
    </KeyboardProvider>
  );
};

export default App;
