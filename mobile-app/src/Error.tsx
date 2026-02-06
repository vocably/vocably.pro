import { signOut } from '@aws-amplify/auth';
import { FC, PropsWithChildren, useCallback, useState } from 'react';
import { Alert, View } from 'react-native';
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
    Alert.alert(
      'Clear the app data?',
      'Clearing app data will permanently delete all progress for unregistered users. Proceed?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            await clearAll();
            await signOut();
          },
          style: 'destructive',
        },
      ]
    );
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
          mode={'contained'}
          style={{ marginTop: 16 }}
          loading={retrying}
          onPress={retry}
        >
          Try {nRetries >= 2 ? 'harder!' : 'again'}
        </Button>
      )}
      <Button mode="text" onPress={clearStorageAndLogOut}>
        Clear the app data and sign out
      </Button>
    </View>
  );
};
