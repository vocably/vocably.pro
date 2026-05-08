import { CardItem, DeckSettings } from '@vocably/model';
import React, { FC } from 'react';
import { Text } from 'react-native-paper';
import { CardDefinition } from '../../CardDefinition';

type Props = {
  card: CardItem;
  onPress?: () => unknown;
  deckSettings: DeckSettings;
};

export const CardBack: FC<Props> = ({ card, onPress, deckSettings }) => {
  if (!card.data.translation && !card.data.definition) {
    return (
      <Text style={{ fontSize: 24 }}>
        This card has no translations nor definitions. Edit this card.
      </Text>
    );
  }
  return (
    <CardDefinition
      onPress={onPress}
      card={card.data}
      textStyle={{ fontSize: 24 }}
      showInflections={true}
      hideDefinitions={deckSettings.hideDefinitions}
    />
  );
};
