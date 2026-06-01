import { useNavigation } from '@react-navigation/native';
import { FC } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CustomScrollView } from '../ui/CustomScrollView';

const styles = StyleSheet.create({
  text: {
    fontSize: 18,
  },
});

type Props = {};

export const HowToEditCardsScreen: FC<Props> = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  navigation.setOptions({ title: t('tips.howToEditCards.title') });

  const bold = <Text style={{ fontWeight: 'bold' }} />;
  const editIcon = <Icon name={'pencil'} size={16} />;

  return (
    <CustomScrollView>
      <View style={{ paddingHorizontal: 16 }}>
        <View style={{ display: 'flex', gap: 12 }}>
          <Text style={styles.text}>{t('tips.howToEditCards.intro')}</Text>
          <Text style={styles.text}>
            <Trans
              i18nKey="tips.howToEditCards.myCardsItem"
              components={{ bold }}
            />
          </Text>
          <Text style={styles.text}>
            <Trans
              i18nKey="tips.howToEditCards.studySessionItem"
              components={{ bold, editIcon }}
            />
          </Text>
        </View>
      </View>
    </CustomScrollView>
  );
};
