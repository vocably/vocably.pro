import { Route } from '@react-navigation/native';
import { StudyStreak, UserMetadata } from '@vocably/model';
import { Hub } from 'aws-amplify/utils';
import React, { FC, useContext, useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Divider, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  DecksCollection,
  LanguagesContext,
} from '../languages/LanguagesContainer';
import { mainPadding } from '../styles';
import { syncDecks } from '../syncAnonymous/syncDecks';
import { syncStudyStreak } from '../syncAnonymous/syncStudyStreak';
import { syncUserMetadata } from '../syncAnonymous/syncUserMetadata';
import { UserMetadataContext } from '../UserMetadataContainer';
import { AuthContext } from './AuthContainer';
import { LoginForm } from './LoginForm';

type Props = {
  route: Route<
    string,
    {
      onLogin: () => void;
    }
  >;
};

export const LoginModal: FC<Props> = ({ route }) => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { onLogin } = route.params;

  const [synchronizing, setSynchronizing] = useState(false);

  const { decks, refreshLanguages } = useContext(LanguagesContext);
  const { userMetadata, studyStreak, refresh } =
    useContext(UserMetadataContext);
  const { status } = useContext(AuthContext);

  const [anonymousDecks, setAnonymousDecks] = useState<DecksCollection>();
  const [anonymousMetadata, setAnonymousMetadata] = useState<UserMetadata>();
  const [anonymousStudyStreak, setAnonymousStudyStreak] =
    useState<StudyStreak>();

  useEffect(() => {
    if (status !== 'anonymous-logged-in') {
      return;
    }
    setAnonymousDecks(decks);
    setAnonymousMetadata(userMetadata);
    setAnonymousStudyStreak(studyStreak);
  }, [decks, status]);

  useEffect(() => {
    return Hub.listen('auth', async (event) => {
      if (event.payload.event !== 'signedIn') {
        return;
      }

      setSynchronizing(true);

      if (anonymousDecks) {
        await syncDecks(Object.values(anonymousDecks).map((d) => d.deck));
      }

      if (anonymousMetadata) {
        await syncUserMetadata(anonymousMetadata);
      }

      if (anonymousStudyStreak) {
        await syncStudyStreak(anonymousStudyStreak);
      }

      await Promise.all([refreshLanguages(), refresh()]);

      onLogin && onLogin();
    });
  }, [
    anonymousDecks,
    anonymousMetadata,
    anonymousStudyStreak,
    refresh,
    refreshLanguages,
  ]);

  const listColor = theme.colors.onBackground;
  const textStyle = {
    fontSize: 18,
    color: listColor,
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
        paddingLeft: insets.left + mainPadding,
        paddingRight: insets.right + mainPadding,
      }}
    >
      <View style={{ width: '90%', gap: 8, marginBottom: 24 }}>
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <Icon name="cloud-outline" size={24} color={listColor} />
          <Text style={textStyle}>Synchronize across devices</Text>
        </View>
        <Divider />
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <Icon name="puzzle-outline" size={24} color={listColor} />
          <Text style={textStyle}>Use browser extensions</Text>
        </View>
        <Divider />
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <Icon name="file-delimited-outline" size={24} color={listColor} />
          <Text style={textStyle}>Import and export CSV data</Text>
        </View>
      </View>
      <LoginForm loading={synchronizing} />
    </ScrollView>
  );
};
