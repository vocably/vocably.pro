import { Analysis, CardItem, Result, TagItem } from '@vocably/model';
import { FC } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { Separator } from '../CardListItem';
import { Deck } from '../languageDeck/useLanguageDeck';
import { Displayer } from '../study/Displayer';
import { AnalyzeResultItem } from './AnalyzeResultItem';
import { associateCards, AssociatedCard } from './associateCards';
import { makeCards } from './makeCards';

type Props = {
  analysis: Analysis;
  cards: CardItem[];
  onAdd: (card: AssociatedCard) => Promise<Result<CardItem>>;
  onRemove: (card: AssociatedCard) => Promise<Result<unknown>>;
  onTagsChange: (id: string, tags: TagItem[]) => Promise<Result<unknown>>;
  style?: StyleProp<ViewStyle>;
  deck: Deck;
  leftInset?: number;
  rightInset?: number;
  cardsLimit: number | 'unlimited';
  isSharedLookup: boolean;
};

export const AnalyzeResult: FC<Props> = ({
  analysis,
  cardsLimit,
  cards,
  onAdd,
  onRemove,
  onTagsChange,
  deck,
  leftInset = 0,
  rightInset = 0,
  isSharedLookup = false,
}) => {
  const associatedCards = associateCards(makeCards(analysis), cards);

  return (
    <Displayer scaleAnimationEnabled={false}>
      {associatedCards.map((item, index) => (
        <View key={`${item.card.source}${item.card.partOfSpeech}`}>
          {index > 0 && <Separator />}
          <AnalyzeResultItem
            leftInset={leftInset}
            rightInset={rightInset}
            onAdd={onAdd}
            onRemove={onRemove}
            onTagsChange={onTagsChange}
            item={item}
            deck={deck}
            cardsLimit={cardsLimit}
            isSharedLookup={isSharedLookup}
          />
        </View>
      ))}
    </Displayer>
  );
};
