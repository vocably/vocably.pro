import { GoogleLanguage, languageList } from '@vocably/model';
import { trimLanguage } from '@vocably/sulna';
import { usePostHog } from 'posthog-react-native';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Linking } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { WelcomeScrollView } from './WelcomeScrollView';

type Props = {
  sourceLanguage: GoogleLanguage;
  targetLanguage: GoogleLanguage;
};

export const SlideDesktopBrowser: FC<Props> = ({
  sourceLanguage,
  targetLanguage,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const posthog = usePostHog();

  return (
    <WelcomeScrollView style={{ gap: 16, alignItems: 'center' }}>
      <Text style={{ fontSize: 22, textAlign: 'center' }}>
        {t('welcome.slideDesktopBrowser.intro')}{' '}
        <Text
          style={{ color: theme.colors.primary }}
          onPress={() => {
            Linking.openURL(
              'https://chromewebstore.google.com/detail/vocably-pro-language-flas/baocigmmhhdemijfjnjdidbkfgpgogmb'
            );
            posthog.capture('onboardingChromeLinkClicked');
          }}
        >
          Chrome
        </Text>{' '}
        {t('welcome.slideDesktopBrowser.or')}{' '}
        <Text
          style={{ color: theme.colors.primary }}
          onPress={() => {
            Linking.openURL('https://apps.apple.com/app/id6464076425');
            posthog.capture('onboardingSafariLinkClicked');
          }}
        >
          Safari
        </Text>{' '}
        {t('welcome.slideDesktopBrowser.browserExtensionSuffix')}{' '}
        <Text style={{ fontWeight: 'bold' }}>
          {trimLanguage(languageList[sourceLanguage])}
        </Text>
        !
      </Text>
      <Image
        source={require('./Desktop.png')}
        style={{
          marginTop: 32,
          width: 300,
          height: 200,
        }}
      />
    </WelcomeScrollView>
  );
};
