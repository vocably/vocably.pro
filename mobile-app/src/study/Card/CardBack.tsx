import { CardItem, DeckSettings } from '@vocably/model';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native-paper';
import { CardDefinition } from '../../CardDefinition';

type Props = {
  card: CardItem;
  onPress?: () => unknown;
  deckSettings: DeckSettings;
};

export const CardBack: FC<Props> = ({ card, onPress, deckSettings }) => {
  const { t } = useTranslation();
  if (!card.data.translation && !card.data.definition) {
    return (
      <Text style={{ fontSize: 24 }}>
        {t('study.cardBack.emptyCardMessage')}
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
