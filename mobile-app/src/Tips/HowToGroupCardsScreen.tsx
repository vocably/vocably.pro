import { useNavigation } from '@react-navigation/native';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { HowToGroupCards } from '../HowToGroupCards';
import { CustomScrollView } from '../ui/CustomScrollView';

type Props = {};

export const HowToGroupCardsScreen: FC<Props> = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  navigation.setOptions({ title: t('tips.howToGroupCards.title') });

  return (
    <CustomScrollView>
      <View style={{ paddingHorizontal: 16 }}>
        <HowToGroupCards />
      </View>
    </CustomScrollView>
  );
};
