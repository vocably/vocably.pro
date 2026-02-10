import { FC, PropsWithChildren, useContext } from 'react';
import { Linking, View } from 'react-native';
import { Button, IconButton, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../auth/AuthContainer';
import { exitSharedScreen } from '../exitSharedScreen';
import { Loader } from '../loaders/Loader';

type Props = {
  os: 'ios' | 'android';
};

export const Login: FC<PropsWithChildren<Props>> = ({ children, os }) => {
  const authStatus = useContext(AuthContext);
  const insets = useSafeAreaInsets();

  if (authStatus.status === 'undefined') {
    return <Loader>Authenticating...</Loader>;
  }

  if (
    authStatus.status === 'logged-in' ||
    authStatus.status === 'anonymous-logged-in'
  ) {
    return <>{children}</>;
  }

  return (
    <View
      style={{
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        gap: 8,
        position: 'relative',
      }}
    >
      <View
        style={{
          paddingLeft: insets.left + 8,
          paddingRight: insets.right + 8,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
        }}
      >
        <IconButton
          icon={'close'}
          onPress={exitSharedScreen}
          style={{ alignSelf: 'flex-end' }}
        />
      </View>
      <Text variant="bodyLarge">Open Vocably to sign in.</Text>
      {os === 'android' && (
        <Button
          mode="contained"
          onPress={() => Linking.openURL('vocably-pro://login')}
        >
          Open Vocably
        </Button>
      )}
    </View>
  );
};
