import { deleteUser, signOut } from '@aws-amplify/auth';
import { FC, useContext } from 'react';
import { Alert, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { clearAll } from '../asyncAppStorage';
import { AuthContext } from '../auth/AuthContainer';
import { useUserEmail } from '../auth/useUserEmail';
import { LanguagesContext } from '../languages/LanguagesContainer';
import { CustomScrollView } from '../ui/CustomScrollView';
import { CustomSurface } from '../ui/CustomSurface';
import { ListItem } from '../ui/ListItem';

type Props = {};

export const AccountScreen: FC<Props> = () => {
  const theme = useTheme();
  const userEmail = useUserEmail();
  const { syncDecks } = useContext(LanguagesContext);
  const { status: authStatus } = useContext(AuthContext);

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

  const onCreateAccount = async () => {};

  return (
    <CustomScrollView>
      <View
        style={{
          marginBottom: 32,
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
          {authStatus === 'logged-in' ? userEmail : 'Anonymous'}
        </Text>
      </View>

      {authStatus === 'logged-in' && (
        <>
          <CustomSurface style={{ marginBottom: 16 }}>
            <ListItem title="Sign out" onPress={onSignOut} leftIcon="logout" />
          </CustomSurface>

          <CustomSurface style={{ marginBottom: 16 }}>
            <ListItem
              title="Delete my account"
              onPress={onAccountDelete}
              color={theme.colors.error}
              leftIcon="trash-can-outline"
            ></ListItem>
          </CustomSurface>
        </>
      )}

      {authStatus === 'anonymous-logged-in' && (
        <>
          <CustomSurface style={{ marginBottom: 16 }}>
            <ListItem
              title="Create an account"
              onPress={onCreateAccount}
              leftIcon="plus"
            />
          </CustomSurface>

          <CustomSurface style={{ marginBottom: 16 }}>
            <ListItem
              title="Delete my data"
              onPress={onDataDelete}
              color={theme.colors.error}
              leftIcon="trash-can-outline"
            ></ListItem>
          </CustomSurface>
        </>
      )}
    </CustomScrollView>
  );
};
