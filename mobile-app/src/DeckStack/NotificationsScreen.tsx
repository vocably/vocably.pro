import { getNotificationTime, setNotificationTime } from '@vocably/api';
import { Result } from '@vocably/model';
import {
  getPermissionStatus,
  GetPermissionStatusOutput,
  requestPermissions as amplifyRequestPermissions,
} from 'aws-amplify/push-notifications';
import { usePostHog } from 'posthog-react-native';
import { FC, useEffect, useState } from 'react';
import { Alert, Platform, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { getTimeZone } from 'react-native-localize';
import { Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelectedDeck } from '../languageDeck/useSelectedDeck';
import { InlineLoader } from '../loaders/InlineLoader';
import { notificationsIdentifyUser } from '../notificationsIdentifyUser';
import { CustomScrollView } from '../ui/CustomScrollView';
import { CustomSurface } from '../ui/CustomSurface';
import { ListItem } from '../ui/ListItem';
import { NotificationsAllowed } from './notifications/NotificationsAllowed';
import { NotificationsDenied } from './notifications/NotificationsDenied';
import { trimLanguage } from '@vocably/sulna';

type Props = {};

const enableNotificationIfNecessary = async (
  language: string
): Promise<Result<unknown>> => {
  const notificationTimeResult = await getNotificationTime(language);
  if (notificationTimeResult.success === false) {
    return notificationTimeResult;
  }

  if (notificationTimeResult.value.exists === true) {
    return notificationTimeResult;
  }

  return await setNotificationTime({
    language,
    IANATimezone: getTimeZone(),
    localTime: '17:00',
  });
};

export const NotificationsScreen: FC<Props> = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [notificationsStatus, setNotificationsStatus] = useState<
    GetPermissionStatusOutput | 'loading'
  >('loading');

  const [enablingNotifications, setEnablingNotifications] = useState(false);

  const {
    deck: { language },
  } = useSelectedDeck({ autoReload: false });

  const postHog = usePostHog();

  useEffect(() => {
    const intervalId = setInterval(async () => {
      const status = await getPermissionStatus();
      setNotificationsStatus(status);
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    postHog.capture('notificationsScreenShow', {
      language,
    });
  }, []);

  const requestPermissions = async () => {
    setEnablingNotifications(true);

    amplifyRequestPermissions({
      alert: true,
      badge: true,
      sound: true,
    })
      .then(async (enabled) => {
        if (!enabled) {
          Alert.alert(
            t('notifications.failedTitle'),
            Platform.OS === 'android'
              ? t('notifications.failedAndroidMessage')
              : t('notifications.failedIosMessage')
          );
        }

        if (enabled) {
          notificationsIdentifyUser();
          await enableNotificationIfNecessary(language);
        }

        postHog.capture('notificationsOSRequested', {
          enabled,
          language,
        });

        setEnablingNotifications(false);
      })
      .catch((e) => {
        postHog.capture('notificationOSRequestError', {
          e,
          language,
        });

        setEnablingNotifications(false);
      });
  };

  return (
    <CustomScrollView>
      {notificationsStatus === 'loading' && (
        <InlineLoader center={false}>
          {t('notifications.checking')}
        </InlineLoader>
      )}

      {notificationsStatus === 'granted' && !enablingNotifications && (
        <NotificationsAllowed language={language} />
      )}
      {notificationsStatus === 'denied' && <NotificationsDenied />}
      {(notificationsStatus === 'shouldExplainThenRequest' ||
        notificationsStatus === 'shouldRequest' ||
        enablingNotifications) && (
        <>
          <CustomSurface style={{ marginBottom: 8 }}>
            <ListItem
              leftIcon="bell"
              title={t('notifications.enableReminders')}
              onPress={requestPermissions}
              disabled={enablingNotifications}
              rightIcon=""
            />
          </CustomSurface>
          <View style={{ paddingHorizontal: 16 }}>
            <Text>
              {t('notifications.remindersDescription', {
                languageName: trimLanguage(t(`language.objective_${language}`)),
              })}
            </Text>
          </View>
        </>
      )}
    </CustomScrollView>
  );
};
