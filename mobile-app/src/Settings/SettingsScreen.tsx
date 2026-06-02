import { deleteUser, signOut } from '@aws-amplify/auth';
import { NavigationProp } from '@react-navigation/native';
import React, { FC, useContext, useState } from 'react';
import { Alert, Pressable, RefreshControl, View } from 'react-native';
import { Trans, useTranslation } from 'react-i18next';
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
import { getLocaleLabel } from '../i18n/supportedLocales';
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
  const { t, i18n } = useTranslation();

  const { selectedLanguage, languages, syncDecks } =
    useContext(LanguagesContext);

  const languageName = trimLanguage(
    t(`language.objective_${selectedLanguage}`)
  );
  const appLanguageLabel = getLocaleLabel(i18n.language);

  const [refreshing, setRefreshing] = useState(false);

  const [versionPressedTimes, setVersionPressedTimes] = useState(0);

  const onSignOut = async () => {
    await syncDecks();
    await signOut();
  };

  const onAccountDelete = () => {
    Alert.alert(
      t('settings.deleteAccount.title'),
      t('settings.deleteAccount.message'),
      [
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            await deleteUser();
            await signOut();
          },
        },
        {
          text: t('common.cancel'),
        },
      ]
    );
  };

  const onDataDelete = () => {
    Alert.alert(
      t('settings.deleteData.title'),
      t('settings.deleteData.message'),
      [
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            await clearAll();
            await signOut();
          },
        },
        {
          text: t('common.cancel'),
        },
      ]
    );
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
          {isRegisteredUser ? userEmail : t('settings.notRegistered')}
        </Text>
      </View>

      <CustomSurface style={{ marginBottom: marginBottom }}>
        {!isRegisteredUser && (
          <>
            <ListItem
              order="first"
              title={t('settings.createAccount')}
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
          leftIcon="translate"
          title={t('settings.appLanguage', { label: appLanguageLabel })}
          onPress={() => navigation.navigate('AppLanguage')}
        />
      </CustomSurface>

      <CustomSurface style={{ marginBottom: marginBottom }}>
        <ListItem
          leftIcon="school-outline"
          title={t('settings.studySettings')}
          onPress={() => navigation.navigate('StudySettings')}
        />
      </CustomSurface>

      {selectedLanguage && (
        <>
          <CustomSurface style={{ marginBottom: 8 }}>
            <ListItem
              leftIcon="bell-outline"
              title={t('settings.studyReminders.title')}
              onPress={goToStudyReminders}
              disabled={!isRegisteredUser}
            />
          </CustomSurface>
          <View style={{ paddingHorizontal: 16, marginBottom: 32, gap: 8 }}>
            {isRegisteredUser && (
              <>
                <Text>
                  <Trans
                    i18nKey="settings.studyReminders.body"
                    values={{ languageName }}
                    components={{
                      bold: <Text style={{ fontWeight: 'bold' }} />,
                    }}
                  />
                </Text>
                {languages.length > 1 && (
                  <Text>{t('settings.studyReminders.perLanguageHint')}</Text>
                )}
              </>
            )}
            {!isRegisteredUser && (
              <Text>{t('settings.studyReminders.unregisteredHint')}</Text>
            )}
          </View>
        </>
      )}

      <CustomSurface style={{ marginBottom: 8 }}>
        <ListItem
          leftIcon="message-text-outline"
          title={t('settings.feedback.title')}
          onPress={() => navigation.navigate('Feedback')}
        />
      </CustomSurface>

      <View style={{ paddingHorizontal: 16, marginBottom: marginBottom }}>
        <Text>{t('settings.feedback.body')}</Text>
      </View>

      {isRegisteredUser && (
        <CustomSurface style={{ marginBottom: marginBottom }}>
          <ListItem
            order="first"
            title={t('settings.signOut')}
            onPress={onSignOut}
            leftIcon="logout"
            rightIcon=""
          />
          <Divider />
          <ListItem
            order="last"
            title={t('settings.deleteAccount.menuItem')}
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
            title={t('settings.deleteData.menuItem')}
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
              {t('settings.version', {
                version: `${VersionNumber.appVersion}${
                  (VersionNumber.buildVersion !== VersionNumber.appVersion &&
                    ` (${VersionNumber.buildVersion})`) ||
                  ``
                }${ENV_SUFFIX ?? ''}`,
              })}
            </Text>
          </Pressable>
        </View>
      )}
    </CustomScrollView>
  );
};
