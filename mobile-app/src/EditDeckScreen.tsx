import { NavigationProp } from '@react-navigation/native';
import React, { FC, useContext } from 'react';
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
          The deck contains {deck.deck.cards.length} card
          {deck.deck.cards.length === 1 ? '' : 's'}
        </Text>
      </View>

      <CustomSurface style={{ marginBottom: 8 }}>
        <ListItem
          title="Study settings"
          onPress={() => {
            navigation.navigate('StudySettingsModal');
          }}
          leftIcon="school-outline"
          rightIcon="menu-right"
          order="first"
        ></ListItem>
        <Divider />
        <ListItem
          title="Export deck"
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
          title="Study reminders"
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
            Study reminders are sent once a day to remind you to review your{' '}
            <Text style={{ fontWeight: 'bold' }}>{languageName}</Text> cards.
          </Text>
        )}
        {!isRegisteredUser && (
          <Text>
            Study reminders are temporarily disabled for unregistered users. I
            am working to resolve this.
          </Text>
        )}
      </View>

      <>
        <CustomSurface style={{ marginBottom: 8 }}>
          <ListSwitch
            title="Hide definitions"
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
          <Text>
            The app will make an attempt to show less definitions in My cards
            and during the study.
          </Text>
        </View>
      </>

      <CustomSurface style={{ marginBottom: 8 }}>
        <ListItem
          leftIcon="message-text-outline"
          title="Provide feedback"
          onPress={() => navigation.navigate('Feedback')}
        />
      </CustomSurface>
      <View style={{ paddingHorizontal: 16, marginBottom: 64 }}>
        <Text>
          Are you missing any crucial feature or simply want to share your
          opinion about Vocably with me? I would love to hear from you!
        </Text>
      </View>

      <CustomSurface>
        <DeleteDeckButton />
      </CustomSurface>
    </CustomScrollView>
  );
};
