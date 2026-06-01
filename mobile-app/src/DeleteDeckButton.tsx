import { useNavigation } from '@react-navigation/native';
import { FC, useContext, useState } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';
import { LanguagesContext } from './languages/LanguagesContainer';
import { ListItem } from './ui/ListItem';
import { useCurrentLanguageName } from './useCurrentLanguageName';

export const DeleteDeckButton: FC = () => {
  const { selectedLanguage, deleteLanguage, languages } =
    useContext(LanguagesContext);
  const navigation = useNavigation();
  const theme = useTheme();
  const languageName = useCurrentLanguageName();
  const { t } = useTranslation();

  const deleteAfterConfirmation = async () => {
    const deleteResult = await deleteLanguage(selectedLanguage);

    if (deleteResult.success === false) {
      Alert.alert(
        t('editDeck.deleteDeckError.title'),
        t('editDeck.deleteDeckError.message')
      );
    }

    if (languages.length > 1) {
      navigation.goBack();
    }
  };

  const onClick = () => {
    Alert.alert(
      t('editDeck.deleteDeckPrompt.title', { languageName }),
      t('editDeck.deleteDeckPrompt.message'),
      [
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            deleteAfterConfirmation();
          },
        },
        {
          text: t('common.cancel'),
        },
      ]
    );
  };

  return (
    <ListItem
      leftIcon="delete"
      rightIcon=""
      title={t('editDeck.deleteDeck')}
      onPress={onClick}
      color={theme.colors.error}
    />
  );
};
