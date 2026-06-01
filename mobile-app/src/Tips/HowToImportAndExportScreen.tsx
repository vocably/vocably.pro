import { useNavigation } from '@react-navigation/native';
import { languageList } from '@vocably/model';
import { get } from 'lodash-es';
import React, { FC, useContext } from 'react';
import { Trans, useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const exportLanguages = useContext(LanguagesContext).languages;
  const { status: authStatus } = useContext(AuthContext);

  const isRegisteredUser = authStatus === 'logged-in';

  const navigation = useNavigation();
  navigation.setOptions({ title: t('tips.howToImportAndExport.title') });

  const alertIcon = <Icon name="alert-circle-outline" size={14} />;

  return (
    <CustomScrollView>
      <CustomSurface style={{ marginBottom: 8 }}>
        <ListItem
          leftIcon="open-in-new"
          title={t('tips.howToImportAndExport.importCards')}
          onPress={() => Linking.openURL('https://app.vocably.pro/import')}
        />
      </CustomSurface>
      <View style={{ paddingHorizontal: 16, marginBottom: 32, gap: 4 }}>
        <Text style={{ fontSize: 16 }}>
          <Trans
            i18nKey="tips.howToImportAndExport.importNote"
            components={{ alertIcon }}
          />
        </Text>
      </View>

      <CustomSurface style={{ marginBottom: 16 }}>
        {exportLanguages.map((language, index) => (
          <View key={language} style={{ alignSelf: 'stretch' }}>
            {index > 0 && <Divider />}
            <ListItem
              leftIcon="file-delimited-outline"
              title={t('tips.howToImportAndExport.exportCards', {
                languageName: get(languageList, language),
              })}
              order={
                exportLanguages.length > 1 && index === 0
                  ? 'first'
                  : exportLanguages.length > 1 &&
                      index === exportLanguages.length - 1
                    ? 'last'
                    : exportLanguages.length > 1
                      ? 'middle'
                      : 'single'
              }
              onPress={() =>
                navigation.navigate('ExportDeckModal', {
                  language: language,
                })
              }
            />
          </View>
        ))}
      </CustomSurface>
    </CustomScrollView>
  );
};
