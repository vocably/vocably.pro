import { CardItem } from '@vocably/model';
import React, { FC } from 'react';
import { Text } from 'react-native-paper';
import { CardDefinition } from '../../CardDefinition';

export const CardBack: FC<{ card: CardItem }> = ({ card }) => {
  if (!card.data.translation && !card.data.definition) {
    return (
      <Text style={{ fontSize: 24 }}>
        This card has no translations nor definitions. Edit this card.
      </Text>
    );
  }
  return (
    <CardDefinition
      card={card.data}
      textStyle={{ fontSize: 24 }}
      showInflections={true}
    />
  );
};
