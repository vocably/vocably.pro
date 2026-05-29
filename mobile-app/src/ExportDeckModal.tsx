import Clipboard from '@react-native-clipboard/clipboard';
import { NavigationProp, Route } from '@react-navigation/native';
import { cardsToCsv } from '@vocably/model-operations';
import { FC, useEffect, useMemo, useState } from 'react';
import { Linking, ScrollView, View } from 'react-native';
import { Button, Portal, Snackbar, Text, useTheme } from 'react-native-paper';
import { CustomScrollView } from './ui/CustomScrollView';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useLanguageDeck } from './languageDeck/useLanguageDeck';
import { InlineLoader } from './loaders/InlineLoader';
import { i18n } from './i18n';

export type ExportDeckParams = {
  language: string;
};

type Props = {
  route: Route<string, any>;
  navigation: NavigationProp<any>;
};

export const ExportDeckModal: FC<Props> = ({ route, navigation }) => {
  const { language } = route.params as ExportDeckParams;
  const { status, deck } = useLanguageDeck({ language, autoReload: true });
  const cards = deck.cards;
  const theme = useTheme();
  const [copied, setCopied] = useState(false);

  const languageName = i18n.t(`language.nominative_short_${language}`, '');

  useEffect(() => {
    navigation.setOptions({
      title: i18n.t('exportDeck.title', { languageName }),
    });
  }, [languageName]);

  const { csv, lexicalaSkipped } = useMemo(
    () => cardsToCsv({ cards, language }),
    [cards, language]
  );

  const handleCopy = () => {
    Clipboard.setString(csv);
    setCopied(true);
  };

  if (status === 'loading') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <InlineLoader>{i18n.t('exportDeck.loadingCards')}</InlineLoader>
      </View>
    );
  }

  return (
    <>
      <CustomScrollView
        contentContainerStyle={{
          gap: 16,
        }}
      >
        <Text style={{ fontSize: 16 }}>
          {i18n.t('exportDeck.advancedExportInfo')}{' '}
          <Text
            onPress={() =>
              Linking.openURL(
                `https://app.vocably.pro/deck/${language}/edit/export`
              )
            }
          >
            <Text
              style={{
                textDecorationLine: 'underline',
                textDecorationStyle: 'solid',
              }}
            >
              {i18n.t('exportDeck.loginWithAccount')}
            </Text>{' '}
            <Icon name="open-in-new" size={13} />
          </Text>
        </Text>
        {lexicalaSkipped && (
          <Text style={{ marginBottom: 16 }}>
            {i18n.t('exportDeck.deprecatedCardsExcluded')}
          </Text>
        )}
        <Button icon={'content-copy'} onPress={handleCopy} mode="outlined">
          {i18n.t('exportDeck.copyToClipboard')}
        </Button>
        <ScrollView
          style={{
            borderRadius: 16,
            backgroundColor: theme.colors.elevation.level2,
            minHeight: 120,
            maxHeight: 400,
          }}
          contentContainerStyle={{ padding: 16 }}
          nestedScrollEnabled={true}
        >
          <Text
            selectable={true}
            style={{
              color: theme.colors.onSurface,
              fontSize: 13,
              fontFamily: 'monospace',
            }}
          >
            {csv}
          </Text>
        </ScrollView>
      </CustomScrollView>
      <Portal>
        <Snackbar
          visible={copied}
          onDismiss={() => setCopied(false)}
          duration={2000}
        >
          {i18n.t('exportDeck.copiedToClipboard')}
        </Snackbar>
      </Portal>
    </>
  );
};
