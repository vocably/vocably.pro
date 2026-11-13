import {
  Analysis,
  CardItem,
  CardsLimit,
  isReverseAnalysis,
  Result,
  TagItem,
} from '@vocably/model';
import { FC, useContext, useState } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { Separator } from '../CardListItem';
import { Deck } from '../languageDeck/useLanguageDeck';
import { isOkayToAskAfterCardAdded } from '../RequestFeedback/isOkayToAskAfterCardAdded';
import { RequestFeedbackSlideDown } from '../RequestFeedback/RequestFeedbackSlideDown';
import { mainPadding } from '../styles';
import { Displayer } from '../study/Displayer';
import { UserMetadataContext } from '../UserMetadataContainer';
import { AnalyzeResultItem } from './AnalyzeResultItem';
import { associateCards, AssociatedCard } from './associateCards';
import { CardVoteContext } from './CardVoteButton';
import { makeCards } from './makeCards';

const cardKey = (card: AssociatedCard): string =>
  `${card.card.source}${card.card.partOfSpeech}`;

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
  cardsLimit: CardsLimit;
  isSharedLookup: boolean;
  alwaysShowSeparator?: boolean;
  requestFeedback?: boolean;
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
  alwaysShowSeparator = false,
  requestFeedback = false,
}) => {
  const associatedCards = associateCards(makeCards(analysis), cards);

  const isReverse = isReverseAnalysis(analysis);
  const voteContext: CardVoteContext = {
    cards: associatedCards.map((associatedCard) => associatedCard.card),
    query: isReverse ? analysis.target : analysis.source,
    sourceLanguage: analysis.sourceLanguage,
    targetLanguage: analysis.targetLanguage,
    direction: isReverse ? 'reverse' : 'direct',
  };

  const { userMetadata } = useContext(UserMetadataContext);
  // The card which addition has triggered the feedback request.
  const [feedbackCardKey, setFeedbackCardKey] = useState<string | null>(null);

  const onCardAdd = async (card: AssociatedCard): Promise<Result<CardItem>> => {
    // The deck doesn't contain the new card yet, hence the + 1.
    const numberOfCards = deck.deck.cards.length + 1;
    const result = await onAdd(card);

    if (!requestFeedback) {
      return result;
    }

    if (
      result.success &&
      isOkayToAskAfterCardAdded({ userMetadata, numberOfCards })
    ) {
      setFeedbackCardKey(cardKey(card));
    }

    return result;
  };

  return (
    <Displayer scaleAnimationEnabled={false}>
      {associatedCards.map((item, index) => (
        <View key={cardKey(item)}>
          {(index > 0 || alwaysShowSeparator) && <Separator />}
          <AnalyzeResultItem
            leftInset={leftInset}
            rightInset={rightInset}
            onAdd={onCardAdd}
            onRemove={onRemove}
            onTagsChange={onTagsChange}
            item={item}
            deck={deck}
            cardsLimit={cardsLimit}
            isSharedLookup={isSharedLookup}
            voteContext={voteContext}
          />
          {!isSharedLookup &&
            requestFeedback &&
            feedbackCardKey === cardKey(item) && (
              <RequestFeedbackSlideDown
                visible={true}
                source={'card-added'}
                style={{
                  paddingLeft: leftInset + mainPadding,
                  paddingRight: rightInset + mainPadding,
                  paddingBottom: 16,
                }}
              />
            )}
        </View>
      ))}
    </Displayer>
  );
};
