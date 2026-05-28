import { CardItem, DeckSettings } from '@vocably/model';
import React, { FC } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native-paper';
import { CardFront } from './CardFront';

type Props = {
  card: CardItem;
  autoPlay: boolean;
  playRandomExample: boolean;
  onPress?: () => unknown;
  deckSettings: DeckSettings;
};

export const ReverseCardBack: FC<Props> = ({
  card,
  autoPlay,
  playRandomExample,
  onPress,
  deckSettings,
}) => {
  const { t } = useTranslation();
  return (
    <View>
      <Text style={{ fontSize: 18, marginBottom: 8 }}>
        {t('study.reverseCardBack.theAnswerIs')}
      </Text>
      <CardFront
        deckSettings={deckSettings}
        autoPlay={autoPlay}
        playRandomExample={playRandomExample}
        card={card}
        showInflections={true}
        onPress={onPress}
      />
    </View>
  );
};
