import { useNavigation } from '@react-navigation/native';
import { usePostHog } from 'posthog-react-native';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Platform, View } from 'react-native';
import { Divider, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslationPreset } from '../TranslationPreset/useTranslationPreset';
import { CustomScrollView } from '../ui/CustomScrollView';
import { CustomSurface } from '../ui/CustomSurface';
import { ListItem } from '../ui/ListItem';
import { GoogleLanguage } from '@vocably/model';
import { mobileStoreName, mobileStoreUrl } from '../mobilePlatform';

type Props = {};

const grammarCheckerExamples: Partial<Record<GoogleLanguage, string>> = {
  en: 'She is doing a coffee.',
  'en-GB': 'She is doing a coffee.',
  nl: 'Ik vind dat leuk, omdat het is lekker.',
  de: 'Ich bin kalt.',
  es: 'Yo soy veinte años viejo.',
  it: 'Sto andandosene a casa.',
  no: 'Det er en stor hus.',
  'pt-PT': 'Eu estou comendo o pequeno-almoço.',
  pt: 'Estou a trabalhar agora.',
};

export const TipsScreen: FC<Props> = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const posthog = usePostHog();
  const { t } = useTranslation();

  const translationPreset = useTranslationPreset();

  if (translationPreset.status !== 'known') {
    return <></>;
  }

  let languagePreset = '';

  if (
    translationPreset.preset.sourceLanguage &&
    translationPreset.preset.translationLanguage
  ) {
    languagePreset =
      translationPreset.preset.sourceLanguage +
      '/' +
      translationPreset.preset.translationLanguage;
  } else if (translationPreset.preset.sourceLanguage) {
    languagePreset = translationPreset.preset.sourceLanguage;
  }

  return (
    <CustomScrollView
      contentContainerStyle={{
        paddingTop: insets.top + 32,
      }}
    >
      <CustomSurface style={{ marginBottom: 32 }}>
        <ListItem
          order="first"
          title={t('tips.menu.editCards')}
          onPress={() => {
            navigation.navigate('HowToEditCards');
            posthog.capture('tip-edit-card-clicked');
          }}
          leftIcon="pencil-outline"
          rightIcon="menu-right"
        ></ListItem>
        <Divider style={{ alignSelf: 'stretch' }} />
        <ListItem
          order="middle"
          title={t('tips.menu.groupCards')}
          onPress={() => {
            navigation.navigate('HowToGroupCards');
            posthog.capture('tip-group-cards-clicked');
          }}
          leftIcon="folder-outline"
          rightIcon="menu-right"
        ></ListItem>
        <Divider style={{ alignSelf: 'stretch' }} />
        <ListItem
          order="middle"
          title={t('tips.menu.importExportCsv')}
          onPress={() => {
            navigation.navigate('HowToImportAndExport');
            posthog.capture('tip-import-export-clicked');
          }}
          leftIcon={'swap-vertical'}
          rightIcon="menu-right"
        ></ListItem>
        <Divider style={{ alignSelf: 'stretch' }} />
        <ListItem
          order="last"
          title={t('tips.menu.studyPlan')}
          onPress={() => {
            navigation.navigate('HowToViewStudyStatistics');
            posthog.capture('tip-view-stats-clicked');
          }}
          leftIcon="chart-box-outline"
          rightIcon="menu-right"
        ></ListItem>
      </CustomSurface>

      <CustomSurface style={{ marginBottom: 32 }}>
        {Platform.OS === 'android' && (
          <ListItem
            order="first"
            title={t('tips.menu.androidTranslate')}
            onPress={() => {
              posthog.capture('tip-android-translate-clicked');
              Linking.openURL(
                `https://app.vocably.pro/page/android-translate/${languagePreset}`
              );
            }}
            leftIcon="android"
            rightIcon="menu-right"
          ></ListItem>
        )}
        {Platform.OS === 'ios' && (
          <ListItem
            order="first"
            title={t('tips.menu.iosTranslate')}
            onPress={() => {
              {
                posthog.capture('tip-ios-translate-clicked');
                Linking.openURL(
                  `https://app.vocably.pro/page/ios-extension/${languagePreset}`
                );
              }
            }}
            leftIcon="apple-safari"
            rightIcon="menu-right"
          ></ListItem>
        )}
        <Divider style={{ alignSelf: 'stretch' }} />
        <ListItem
          leftIcon="laptop"
          order="middle"
          title={t('tips.menu.desktopExtension')}
          onPress={() => {
            posthog.capture('tip-desktop-extension-clicked');
            Linking.openURL(`https://vocably.pro`);
          }}
        ></ListItem>
        <Divider style={{ alignSelf: 'stretch' }} />
        <ListItem
          order="last"
          leftIcon="spellcheck"
          title={t('tips.menu.grammarChecker')}
          onPress={() => {
            const url = new URL('https://vocably.pro/grammar.html');
            if (
              translationPreset.status === 'known' &&
              translationPreset.preset.sourceLanguage
            ) {
              url.searchParams.append(
                'language',
                translationPreset.preset.sourceLanguage
              );

              if (
                grammarCheckerExamples[
                  translationPreset.preset.sourceLanguage as GoogleLanguage
                ]
              ) {
                url.searchParams.append(
                  'text',
                  grammarCheckerExamples[
                    translationPreset.preset.sourceLanguage as GoogleLanguage
                  ] ?? ''
                );
              }
            }

            if (
              translationPreset.status === 'known' &&
              translationPreset.preset.translationLanguage
            ) {
              url.searchParams.append(
                'explanationLanguage',
                translationPreset.preset.translationLanguage
              );
            }

            Linking.openURL(url.toString());
          }}
        ></ListItem>
      </CustomSurface>

      <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
        <Text>{t('tips.menu.feedbackBody')}</Text>
      </View>
      <CustomSurface style={{ marginBottom: 32 }}>
        <ListItem
          leftIcon="message-text-outline"
          title={t('tips.menu.provideFeedback')}
          onPress={() => {
            posthog.capture('tip-feedback-clicked');
            navigation.navigate('Feedback');
          }}
        />
      </CustomSurface>

      <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
        <Text>{t('tips.menu.supportBody')}</Text>
      </View>
      <CustomSurface style={{ marginBottom: 8 }}>
        <ListItem
          order="first"
          leftIcon="star-outline"
          title={t('tips.menu.rate', { storeName: mobileStoreName })}
          onPress={() => {
            posthog.capture('tip-rate-clicked');
            Linking.openURL(mobileStoreUrl);
          }}
        />
        <Divider />
        <ListItem
          order="middle"
          leftIcon="facebook"
          title={t('tips.menu.shareOnFacebook')}
          onPress={() => {
            posthog.capture('tip-facebook-clicked');
            Linking.openURL(
              'https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fvocably.pro'
            );
          }}
        />
        <Divider />
        <ListItem
          order="last"
          leftIcon="twitter"
          title={t('tips.menu.shareOnTwitter')}
          onPress={() => {
            posthog.capture('tip-twitter-clicked');
            Linking.openURL(
              'https://twitter.com/intent/tweet?url=https%3A%2F%2Fvocably.pro'
            );
          }}
        />
      </CustomSurface>
    </CustomScrollView>
  );
};
