import {
  deleteNotificationTime as deleteNotificationTimeApi,
  getNotificationTime as getNotificationTimeApi,
  setNotificationTime as setNotificationTimeApi,
} from '@vocably/api';
import { GetNotificationTimeResult, languageList } from '@vocably/model';
import { trimLanguage } from '@vocably/sulna';
import { get } from 'lodash-es';
import { usePostHog } from 'posthog-react-native';
import { FC, useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { getTimeZone } from 'react-native-localize';
import { Text } from 'react-native-paper';
import { InlineLoader } from '../../loaders/InlineLoader';
import { CustomSurface } from '../../ui/CustomSurface';
import { ListSwitch } from '../../ui/ListSwitch';
import { useAsync } from '../../useAsync';
import { TimePicker } from './TimePicker';

type Props = {
  language: string;
};

const getNotificationTime = (language: string) => async () => {
  const result = await getNotificationTimeApi(language);
  if (result.success === true) {
    return result.value;
  }

  throw new Error(`Unable to get notification time for ${language}`);
};

let lastAbortController: AbortController;
const setNotificationTime =
  (language: string) => async (payload: GetNotificationTimeResult) => {
    lastAbortController && lastAbortController.abort();
    lastAbortController = new AbortController();

    if (payload.exists === true) {
      const result = await setNotificationTimeApi(
        {
          localTime: payload.time,
          language,
          IANATimezone: getTimeZone(),
        },
        lastAbortController
      );

      if (
        result.success === false &&
        result.errorCode !== 'API_REQUEST_ABORTED'
      ) {
        console.error('Unable to set notification time', result);
        throw new Error(`Unable to set notification time for ${language}`);
      }
    } else {
      const result = await deleteNotificationTimeApi(
        payload.language,
        lastAbortController
      );

      if (result.success === false) {
        throw new Error(`Unable to delete notification time for ${language}`);
      }
    }
  };

const defaultNotificationTime = '17:00';

export const NotificationsAllowed: FC<Props> = ({ language }) => {
  const [loadNotificationsResult, mutateNotifications] = useAsync(
    getNotificationTime(language),
    setNotificationTime(language)
  );
  const posthog = usePostHog();
  const { t } = useTranslation();
  const [isSwitching, setIsSwitching] = useState(false);

  const languageString = trimLanguage(get(languageList, language, ''));

  const enableOrDisableNotificationTime = async () => {
    if (isSwitching) {
      return;
    }

    if (loadNotificationsResult.status !== 'loaded') {
      return;
    }

    setIsSwitching(true);

    try {
      await mutateNotifications(
        loadNotificationsResult.value.exists
          ? {
              exists: false,
              language: loadNotificationsResult.value.language,
            }
          : {
              exists: true,
              language: loadNotificationsResult.value.language,
              time: defaultNotificationTime,
            }
      );
    } catch (e) {}

    if (loadNotificationsResult.value.exists) {
      posthog.capture('notificationsDisabled', {
        language,
      });
    } else {
      posthog.capture('notificationsEnabled', {
        language,
      });
    }

    setIsSwitching(false);
  };

  return (
    <>
      {loadNotificationsResult.status === 'loading' && (
        <InlineLoader center={false}>
          {t('notifications.loadingPreset')}
        </InlineLoader>
      )}
      {loadNotificationsResult.status === 'failed' && (
        <>
          <Text>{t('notifications.loadFailed.sorry')}</Text>
          <Text>{t('notifications.loadFailed.cannotLoad')}</Text>
          <Text>{t('notifications.loadFailed.informed')}</Text>
          <Text>{t('notifications.loadFailed.tryAgain')}</Text>
        </>
      )}
      {loadNotificationsResult.status === 'loaded' && (
        <>
          <CustomSurface style={{ marginBottom: 8 }}>
            <ListSwitch
              title={t('notifications.enabledFor', { languageString })}
              value={loadNotificationsResult.value.exists}
              onChange={enableOrDisableNotificationTime}
            />
          </CustomSurface>
          <View style={{ paddingHorizontal: 16, marginBottom: 32 }}>
            <Text>
              {t('notifications.remindersDescription', {
                languageName: trimLanguage(t(`language.objective_${language}`)),
              })}
            </Text>
          </View>
          {loadNotificationsResult.value.exists && (
            <CustomSurface>
              <TimePicker
                disabled={!loadNotificationsResult.value.exists || isSwitching}
                time={
                  (loadNotificationsResult.value.exists &&
                    loadNotificationsResult.value.time) ||
                  defaultNotificationTime
                }
                onChange={(time) => {
                  posthog.capture('notificationsSetTime', { time });

                  mutateNotifications({
                    language: loadNotificationsResult.value.language,
                    time,
                    exists: true,
                  });
                }}
              />
            </CustomSurface>
          )}
        </>
      )}
    </>
  );
};
