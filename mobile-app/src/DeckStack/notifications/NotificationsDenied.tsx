import { FC } from 'react';
import { Linking, Platform, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Text } from 'react-native-paper';

type Props = {};

export const NotificationsDenied: FC<Props> = () => {
  const { t } = useTranslation();
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        gap: 12,
      }}
    >
      {Platform.OS !== 'ios' && (
        <Text>{t('notifications.deniedAndroidMessage')}</Text>
      )}
      {Platform.OS === 'ios' && (
        <>
          <Text>{t('notifications.deniedIosMessage')}</Text>
          <Button mode="contained" onPress={() => Linking.openSettings()}>
            {t('notifications.openSettings')}
          </Button>
        </>
      )}
    </View>
  );
};
