import { useNavigation } from '@react-navigation/native';
import { languageList } from '@vocably/model';
import { get } from 'lodash-es';
import React, { FC, useContext } from 'react';
import { Linking, View } from 'react-native';
import { Divider, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthContext } from '../auth/AuthContainer';
import { LanguagesContext } from '../languages/LanguagesContainer';
import { CustomScrollView } from '../ui/CustomScrollView';
import { CustomSurface } from '../ui/CustomSurface';
import { ListItem } from '../ui/ListItem';

type Props = {};

export const HowToImportAndExportScreen: FC<Props> = () => {
  const exportLanguages = useContext(LanguagesContext).languages;
  const { status: authStatus } = useContext(AuthContext);

  const isRegisteredUser = authStatus === 'logged-in';

  const navigation = useNavigation();
  navigation.setOptions({
    title: 'Import and export CSV',
  });

  return (
    <CustomScrollView>
      <View style={{ gap: 8, marginBottom: 32, paddingHorizontal: 16 }}>
        <Text style={{ fontSize: 18 }}>
          <Icon name="alert-circle-outline" size={18} /> Available only for
          registered users.
        </Text>
        <Text style={{ fontSize: 18 }}>
          You will be redirected to the website.
        </Text>
        <Text style={{ fontSize: 18 }}>
          Login with your account to proceed.
        </Text>
      </View>

      <CustomSurface style={{ marginBottom: 16 }}>
        <ListItem
          order="first"
          leftIcon="open-in-new"
          title="Import cards"
          onPress={() => Linking.openURL('https://app.vocably.pro/import')}
        />
        {exportLanguages.map((language, index) => (
          <View key={language} style={{ alignSelf: 'stretch' }}>
            <Divider />
            <ListItem
              leftIcon="open-in-new"
              title={`Export your ${get(languageList, language)} cards`}
              order={index < exportLanguages.length - 1 ? 'middle' : 'last'}
              onPress={() =>
                Linking.openURL(
                  `https://app.vocably.pro/deck/${language}/edit/export`
                )
              }
            />
          </View>
        ))}
      </CustomSurface>
    </CustomScrollView>
  );
};
