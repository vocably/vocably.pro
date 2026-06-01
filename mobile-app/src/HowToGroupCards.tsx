import { FC } from 'react';
import { StyleSheet, View } from 'react-native';
import { Trans, useTranslation } from 'react-i18next';
import { Text, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = {};

const styles = StyleSheet.create({
  text: {
    fontSize: 18,
  },
});

export const HowToGroupCards: FC<Props> = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const tagPlusIcon = <Icon name={'tag-plus'} size={24} />;
  const tagIcon = <Icon name={'tag'} size={24} />;

  return (
    <View style={{ display: 'flex', gap: 12 }}>
      <Text style={styles.text}>{t('howToGroupCards.intro')}</Text>
      <Text style={styles.text}>
        <Trans
          i18nKey="howToGroupCards.swipeLeft"
          components={{ tagPlusIcon }}
        />
      </Text>
      <Text style={styles.text}>
        <Trans
          i18nKey="howToGroupCards.tapOnNew"
          components={{ tagPlusIcon }}
        />
      </Text>
      <Text style={styles.text}>
        <Trans i18nKey="howToGroupCards.studyByTag" components={{ tagIcon }} />
      </Text>
      <Text style={styles.text}>{t('howToGroupCards.swipeToEdit')}</Text>
    </View>
  );
};
