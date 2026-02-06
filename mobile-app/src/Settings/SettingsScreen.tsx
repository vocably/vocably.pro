import { deleteUser, signOut } from '@aws-amplify/auth';
import { NavigationProp } from '@react-navigation/native';
import React, { FC, useContext, useState } from 'react';
import { Alert, Pressable, RefreshControl, View } from 'react-native';
import { Divider, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import VersionNumber from 'react-native-version-number';
// @ts-ignore
import { ENV_SUFFIX, SHOW_DEBUG_MENU } from '@env';
import { languageList } from '@vocably/model';
import { trimLanguage } from '@vocably/sulna';
import { get } from 'lodash-es';
import { clearAll } from '../asyncAppStorage';
import { AuthContext } from '../auth/AuthContainer';
import { useUserEmail } from '../auth/useUserEmail';
import { CustomerInfoContext } from '../CustomerInfoContainer';
import { LanguagesContext } from '../languages/LanguagesContainer';
import { CustomScrollView } from '../ui/CustomScrollView';
import { CustomSurface } from '../ui/CustomSurface';
import { ListItem } from '../ui/ListItem';
import { UserMetadataContext } from '../UserMetadataContainer';
import { DebugMenu } from './DebugMenu';
import { Subscription } from './Subscription';

type Props = {
  navigation: NavigationProp<any>;
};

export const SettingsScreen: FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const userEmail = useUserEmail();
  const { refresh: refreshCustomerInfo } = useContext(CustomerInfoContext);
  const { refresh: refreshUserMetadata } = useContext(UserMetadataContext);
  const { status: authStatus } = useContext(AuthContext);

  const { selectedLanguage, languages, syncDecks } =
    useContext(LanguagesContext);

  const languageName = trimLanguage(get(languageList, selectedLanguage, ''));

  const [refreshing, setRefreshing] = useState(false);

  const [versionPressedTimes, setVersionPressedTimes] = useState(0);

  const onSignOut = async () => {
    await syncDecks();
    await signOut();
  };

  const onAccountDelete = () => {
    Alert.alert('Delete your account?', 'This operation cannot be undone.', [
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteUser();
          await signOut();
        },
      },
      {
        text: 'Cancel',
      },
    ]);
  };

  const onDataDelete = () => {
    Alert.alert('Delete your data?', 'This operation cannot be undone.', [
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await clearAll();
          await signOut();
        },
      },
      {
        text: 'Cancel',
      },
    ]);
  };

  const onCreateAccount = async () => {
    navigation.navigate('LoginModal', {
      onLogin: () => {
        navigation.navigate('DeckScreen');
      },
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshCustomerInfo(), refreshUserMetadata()]);
    setRefreshing(false);
  };

  const [customerInfoRefreshing, setCustomerInfoRefreshing] = useState(false);

  const customerInfoRefresh = async () => {
    setCustomerInfoRefreshing(true);
    await refreshCustomerInfo();
    setCustomerInfoRefreshing(false);
  };

  const goToStudyReminders = () => {
    navigation.navigate('DeckScreen', {
      screen: 'Notifications',
    });
  };

  const marginBottom = 24;

  const isRegisteredUser = authStatus === 'logged-in';

  // @ts-ignore
  return (
    <CustomScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={{
        paddingTop: insets.top + 32,
      }}
    >
      <View
        style={{
          marginBottom: marginBottom,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          marginLeft: 8,
        }}
      >
        <Icon
          name="account-circle-outline"
          color={theme.colors.onBackground}
          size={24}
        />
        <Text style={{ fontSize: 16 }}>
          {isRegisteredUser ? userEmail : 'Not registered yet.'}
        </Text>
      </View>

      <CustomSurface style={{ marginBottom: marginBottom }}>
        {!isRegisteredUser && (
          <>
            <ListItem
              order="first"
              title="Create an account"
              onPress={onCreateAccount}
              leftIcon="plus"
            />
            <Divider />
          </>
        )}
        <Subscription
          isInGroup={!isRegisteredUser}
          isRefreshing={customerInfoRefreshing}
          onRefresh={customerInfoRefresh}
        />
      </CustomSurface>

      <CustomSurface style={{ marginBottom: marginBottom }}>
        <ListItem
          leftIcon="school-outline"
          title="Study settings"
          onPress={() => navigation.navigate('StudySettings')}
        />
      </CustomSurface>

      {selectedLanguage && (
        <>
          <CustomSurface style={{ marginBottom: 8 }}>
            <ListItem
              leftIcon="bell-outline"
              title="Study reminders"
              onPress={goToStudyReminders}
              disabled={!isRegisteredUser}
            />
          </CustomSurface>
          <View style={{ paddingHorizontal: 16, marginBottom: 32, gap: 8 }}>
            {isRegisteredUser && (
              <>
                <Text>
                  Study reminders are sent once a day to remind you to review
                  your{' '}
                  <Text style={{ fontWeight: 'bold' }}>{languageName}</Text>{' '}
                  cards.
                </Text>
                {languages.length > 1 && (
                  <Text>
                    Every language has it's own reminder settings available in
                    the "Edit deck" screen.
                  </Text>
                )}
              </>
            )}
            {!isRegisteredUser && (
              <Text>
                Study reminders are temporarily disabled for unregistered users.
                I am working to resolve this.
              </Text>
            )}
          </View>
        </>
      )}

      <CustomSurface style={{ marginBottom: 8 }}>
        <ListItem
          leftIcon="message-text-outline"
          title="Provide feedback"
          onPress={() => navigation.navigate('Feedback')}
        />
      </CustomSurface>

      <View style={{ paddingHorizontal: 16, marginBottom: marginBottom }}>
        <Text>
          Are you missing any crucial feature or simply want to share your
          opinion about Vocably with me? I would love to hear from you!
        </Text>
      </View>

      {isRegisteredUser && (
        <CustomSurface style={{ marginBottom: marginBottom }}>
          <ListItem
            order="first"
            title="Sign out"
            onPress={onSignOut}
            leftIcon="logout"
            rightIcon=""
          />
          <Divider />
          <ListItem
            order="last"
            title="Delete my account"
            onPress={onAccountDelete}
            color={theme.colors.error}
            leftIcon="trash-can-outline"
            rightIcon=""
          ></ListItem>
        </CustomSurface>
      )}

      {!isRegisteredUser && (
        <CustomSurface style={{ marginBottom: marginBottom }}>
          <ListItem
            title="Delete my data"
            onPress={onDataDelete}
            color={theme.colors.error}
            leftIcon="trash-can-outline"
            rightIcon=""
          ></ListItem>
        </CustomSurface>
      )}

      {(SHOW_DEBUG_MENU === 'true' || versionPressedTimes > 2) && (
        <View style={{ marginBottom: marginBottom }}>
          <DebugMenu />
        </View>
      )}

      {VersionNumber.appVersion && (
        <View
          style={{
            paddingHorizontal: 16,
            marginBottom: marginBottom,
            gap: 16,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Pressable
            onPress={() => setVersionPressedTimes(versionPressedTimes + 1)}
            style={{ backgroundColor: 'transparent' }}
          >
            <Text>
              Version:{' '}
              {`${VersionNumber.appVersion}${
                (VersionNumber.buildVersion !== VersionNumber.appVersion &&
                  ` (${VersionNumber.buildVersion})`) ||
                ``
              }`}
              {ENV_SUFFIX ?? ''}
            </Text>
          </Pressable>
        </View>
      )}
    </CustomScrollView>
  );
};
