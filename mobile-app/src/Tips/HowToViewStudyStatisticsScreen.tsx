import { useNavigation } from '@react-navigation/native';
import React, { FC } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CustomScrollView } from '../ui/CustomScrollView';

type Props = {};

export const HowToViewStudyStatisticsScreen: FC<Props> = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  navigation.setOptions({ title: t('tips.howToViewStudyStatistics.title') });

  const navigateToStudySettings = async () => {
    navigation.navigate('Settings');
  };

  const bold = <Text style={{ fontWeight: 'bold' }} />;
  const chartBoxIcon = <Icon name={'chart-box-outline'} size={24} />;
  const myCards = (
    <Text
      style={{ color: theme.colors.primary }}
      onPress={() => navigation.navigate('DeckScreen')}
    />
  );
  const studySettings = (
    <Text
      onPress={navigateToStudySettings}
      style={{ color: theme.colors.primary }}
    />
  );

  return (
    <CustomScrollView>
      <View style={{ gap: 8, marginBottom: 32, paddingHorizontal: 16 }}>
        <Text style={{ fontSize: 18 }}>
          <Trans
            i18nKey="tips.howToViewStudyStatistics.para1"
            components={{ bold }}
          />
        </Text>

        <Text style={{ fontSize: 18 }}>
          <Trans
            i18nKey="tips.howToViewStudyStatistics.para2"
            components={{ myCards, chartBoxIcon }}
          />
        </Text>

        <Text style={{ fontSize: 18 }}>
          <Trans
            i18nKey="tips.howToViewStudyStatistics.para3"
            components={{ bold, studySettings }}
          />
        </Text>
      </View>
    </CustomScrollView>
  );
};
