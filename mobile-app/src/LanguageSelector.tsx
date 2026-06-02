import { useNavigation } from '@react-navigation/native';
import { getFullLanguageName } from '@vocably/model';
import { FC, useContext, useState } from 'react';
import { PixelRatio, StyleProp, View, ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Divider,
  Menu,
  Text,
  TouchableRipple,
  useTheme,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LanguagesContext } from './languages/LanguagesContainer';
import { popularLanguages } from './SourceLanguageButton';
import { upperFirst } from 'lodash-es';

type Props = {
  style?: StyleProp<ViewStyle>;
};

export const LanguageSelector: FC<Props> = ({ style }) => {
  const { t } = useTranslation();
  const { languages, selectedLanguage, selectLanguage, addNewLanguage } =
    useContext(LanguagesContext);

  const [visible, setVisible] = useState(false);
  const theme = useTheme();
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const navigation = useNavigation();

  const onSelect = (language: string) => {
    selectLanguage(language).then();
    setTimeout(() => {
      closeMenu();
    }, 400);
  };

  const fontScale = PixelRatio.getFontScale();

  const onLanguageSelect = async (language: string) => {
    if (languages.includes(language)) {
      await selectLanguage(language);
      return;
    }

    addNewLanguage(language);
  };

  const onAddNewLanguageClick = () => {
    closeMenu();
    navigation.navigate('LanguageSelector', {
      title: t('languageSelector.addNewLanguage'),
      onSelect: onLanguageSelect,
      preferred: popularLanguages,
      preferredTitle: t('languageSelector.popularLanguages'),
    });
  };

  return (
    <>
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <TouchableRipple
            hitSlop={24}
            onPress={openMenu}
            borderless={true}
            style={[{ borderRadius: 32, padding: 8 }, style]}
          >
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
            >
              <Icon
                color={theme.colors.onBackground}
                name="earth"
                size={24 * fontScale}
              />
              {languages.length > 1 && (
                <Text style={{ fontSize: 16, fontWeight: '500' }}>
                  {selectedLanguage.toUpperCase()}
                </Text>
              )}
            </View>
          </TouchableRipple>
        }
      >
        {languages.map((language) => (
          <Menu.Item
            key={language}
            title={upperFirst(t(`language.nominative_${language}`))}
            onPress={() => onSelect(language)}
            titleStyle={{
              color: theme.colors.secondary,
            }}
            contentStyle={{
              flex: 1,
            }}
            trailingIcon={language === selectedLanguage ? 'check' : undefined}
          />
        ))}
        <Divider />
        <Menu.Item
          title={t('languageSelector.addNewLanguage')}
          onPress={onAddNewLanguageClick}
          titleStyle={{ color: theme.colors.secondary }}
          leadingIcon={'plus'}
          style={{ paddingRight: 32 }}
        />
      </Menu>
    </>
  );
};
