import { NavigationProp } from '@react-navigation/native';
import React, { FC, useContext, useState } from 'react';
import { Pressable, RefreshControl, View } from 'react-native';
import { Divider, Text } from 'react-native-paper';
import VersionNumber from 'react-native-version-number';
// @ts-ignore
import { ENV_SUFFIX, SHOW_DEBUG_MENU } from '@env';
import { languageList } from '@vocably/model';
import { trimLanguage } from '@vocably/sulna';
import { get } from 'lodash-es';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const { refresh: refreshCustomerInfo } = useContext(CustomerInfoContext);
  const { refresh: refreshUserMetadata } = useContext(UserMetadataContext);

  const { selectedLanguage, languages } = useContext(LanguagesContext);

  const languageName = trimLanguage(get(languageList, selectedLanguage, ''));

  const [refreshing, setRefreshing] = useState(false);

  const [versionPressedTimes, setVersionPressedTimes] = useState(0);

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
      <CustomSurface style={{ marginBottom: 16 }}>
        <ListItem
          order="first"
          leftIcon="account-circle-outline"
          title="My account"
          onPress={() => navigation.navigate('AccountMenu')}
        />
        <Divider />
        <ListItem
          order="last"
          leftIcon="school-outline"
          title="Study settings"
          onPress={() => navigation.navigate('StudySettings')}
        />
      </CustomSurface>

      <Subscription
        style={{ marginBottom: 16 }}
        isRefreshing={customerInfoRefreshing}
        onRefresh={customerInfoRefresh}
      />

      {selectedLanguage && (
        <>
          <CustomSurface style={{ marginBottom: 8 }}>
            <ListItem
              leftIcon="bell-outline"
              title="Study reminders"
              onPress={goToStudyReminders}
            />
          </CustomSurface>
          <View style={{ paddingHorizontal: 16, marginBottom: 32, gap: 8 }}>
            <Text>
              Study reminders are sent once a day to remind you to review your{' '}
              <Text style={{ fontWeight: 'bold' }}>{languageName}</Text> cards.
            </Text>
            {languages.length > 1 && (
              <Text>
                Every language has it's own reminder settings available in the
                "Edit deck" screen.
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

      <View style={{ paddingHorizontal: 16 }}>
        <Text>
          Are you missing any crucial feature or simply want to share your
          opinion about Vocably with me? I would love to hear from you!
        </Text>
      </View>

      {(SHOW_DEBUG_MENU === 'true' || versionPressedTimes > 2) && <DebugMenu />}

      {VersionNumber.appVersion && (
        <View
          style={{
            paddingHorizontal: 16,
            marginBottom: 16,
            gap: 16,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 48,
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
