import { NavigationProp } from '@react-navigation/native';
import React, { FC, useContext } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Divider, Text, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthContext } from './auth/AuthContainer';
import { DeleteDeckButton } from './DeleteDeckButton';
import { useSelectedDeck } from './languageDeck/useSelectedDeck';
import { CustomScrollView } from './ui/CustomScrollView';
import { CustomSurface } from './ui/CustomSurface';
import { ListItem } from './ui/ListItem';
import { useCurrentLanguageName } from './useCurrentLanguageName';
import { ListSwitch } from './ui/ListSwitch';

type Props = {
  navigation: NavigationProp<any>;
};

export const EditDeckScreen: FC<Props> = ({ navigation }) => {
  const languageName = useCurrentLanguageName();
  const deck = useSelectedDeck({ autoReload: false });
  const theme = useTheme();
  const { t } = useTranslation();
  const { status: authStatus } = useContext(AuthContext);

  const isRegisteredUser = authStatus === 'logged-in';

  return (
    <CustomScrollView>
      <View
        style={{
          marginBottom: 32,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          marginLeft: 8,
        }}
      >
        <Icon
          name="card-multiple-outline"
          color={theme.colors.onBackground}
          size={24}
        />
        <Text style={{ fontSize: 16 }}>
          {t('editDeck.deckContainsCards', {
            count: deck.deck.cards.length,
          })}
        </Text>
      </View>

      <CustomSurface style={{ marginBottom: 8 }}>
        <ListItem
          title={t('editDeck.studySettings')}
          onPress={() => {
            navigation.navigate('StudySettingsModal');
          }}
          leftIcon="school-outline"
          rightIcon="menu-right"
          order="first"
        ></ListItem>
        <Divider />
        <ListItem
          title={t('editDeck.exportDeck')}
          onPress={() => {
            navigation.navigate('ExportDeckModal', {
              language: deck.deck.language,
            });
          }}
          leftIcon="file-delimited-outline"
          rightIcon="menu-right"
          order="middle"
        ></ListItem>
        <Divider />
        <ListItem
          title={t('editDeck.studyReminders')}
          onPress={() => navigation.navigate('Notifications')}
          leftIcon="bell-outline"
          rightIcon="menu-right"
          order="last"
          disabled={!isRegisteredUser}
        ></ListItem>
      </CustomSurface>
      <View style={{ paddingHorizontal: 16, marginBottom: 32, gap: 8 }}>
        {isRegisteredUser && (
          <Text>
            <Trans
              i18nKey="settings.studyReminders.body"
              values={{ languageName }}
              components={{ bold: <Text style={{ fontWeight: 'bold' }} /> }}
            />
          </Text>
        )}
        {!isRegisteredUser && (
          <Text>{t('editDeck.studyRemindersUnregisteredHint')}</Text>
        )}
      </View>

      <>
        <CustomSurface style={{ marginBottom: 8 }}>
          <ListSwitch
            title={t('editDeck.hideDefinitions')}
            value={deck.deck.settings?.hideDefinitions ?? false}
            onChange={async (value: boolean) => {
              await deck.updateSettings({
                ...deck.deck.settings,
                hideDefinitions: value,
              });
            }}
          />
        </CustomSurface>
        <View
          style={{
            paddingHorizontal: 16,
            marginBottom: 32,
          }}
        >
          <Text>{t('editDeck.hideDefinitionsHint')}</Text>
        </View>
      </>

      <CustomSurface style={{ marginBottom: 8 }}>
        <ListItem
          leftIcon="message-text-outline"
          title={t('settings.feedback.title')}
          onPress={() => navigation.navigate('Feedback')}
        />
      </CustomSurface>
      <View style={{ paddingHorizontal: 16, marginBottom: 64 }}>
        <Text>{t('settings.feedback.body')}</Text>
      </View>

      <CustomSurface>
        <DeleteDeckButton />
      </CustomSurface>
    </CustomScrollView>
  );
};
