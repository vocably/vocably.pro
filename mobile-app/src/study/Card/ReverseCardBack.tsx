import { CardItem } from '@vocably/model';
import React, { FC } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { CardFront } from './CardFront';

type Props = {
  card: CardItem;
  autoPlay: boolean;
  playRandomExample: boolean;
};

export const ReverseCardBack: FC<Props> = ({
  card,
  autoPlay,
  playRandomExample,
}) => {
  return (
    <View>
      <Text style={{ fontSize: 18, marginBottom: 8 }}>The answer is</Text>
      <CardFront
        autoPlay={autoPlay}
        playRandomExample={playRandomExample}
        card={card}
        showInflections={true}
      />
    </View>
  );
};
