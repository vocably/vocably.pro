import { FC, PropsWithChildren, useCallback, useState } from 'react';
import { Alert, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Text } from 'react-native-paper';
import { clearAll } from './asyncAppStorage';

type Error = FC<
  PropsWithChildren<{
    onRetry?: () => Promise<any>;
  }>
>;

export const Error: Error = ({ children, onRetry }) => {
  const [retrying, setRetrying] = useState(false);
  const [nRetries, nRetriesSet] = useState(0);
  const { t } = useTranslation();
  const retry = useCallback(() => {
    if (!onRetry) {
      return;
    }

    setRetrying(true);
    onRetry().then(() => {
      setTimeout(() => {
        setRetrying(false);
        nRetriesSet(nRetries + 1);
      }, 1000);
    });
  }, [onRetry, nRetries, nRetriesSet]);

  const clearStorageAndLogOut = async () => {
    Alert.alert(t('error.clearData.title'), t('error.clearData.message'), [
      {
        text: t('common.cancel'),
        style: 'cancel',
      },
      {
        text: t('common.yes'),
        onPress: async () => {
          await clearAll();
          // Loaded on demand: Amplify needs native modules at import time.
          const { signOut } = await import('@aws-amplify/auth');
          await signOut();
        },
        style: 'destructive',
      },
    ]);
  };

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'stretch',
        justifyContent: 'center',
        paddingHorizontal: 32,
        gap: 16,
      }}
    >
      <Text style={{ textAlign: 'center' }}>{children}</Text>
      {onRetry && (
        <Button
          testID="error-retry"
          mode={'contained'}
          style={{ marginTop: 16 }}
          loading={retrying}
          onPress={retry}
        >
          {nRetries >= 2 ? t('error.tryHarder') : t('error.tryAgain')}
        </Button>
      )}
      <Button
        testID="error-clear-and-sign-out"
        mode="text"
        onPress={clearStorageAndLogOut}
      >
        {t('error.clearAndSignOut')}
      </Button>
    </View>
  );
};
