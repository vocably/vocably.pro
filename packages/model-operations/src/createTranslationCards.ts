import { Collection } from '@vocably/crud';
import { AnalysisItem, SrsCard, TranslationCard } from '@vocably/model';
import { explode, join } from '@vocably/sulna';
import { merge } from 'lodash-es';
import { byCard, equalCards } from './compareCards';
import { analysisItemToCard } from './analysisItemToCard';

export const getCardCandidates = (
  collection: Collection<SrsCard>,
  cardCandidates: SrsCard[]
): TranslationCard[] => {
  return cardCandidates.map((card) => {
    const existingItem = collection.find(byCard(card));

    if (existingItem === undefined) {
      return {
        data: card,
      };
    }

    return merge({ data: card }, existingItem);
  });
};

export const combineCards = (acc: SrsCard[], card: SrsCard): SrsCard[] => {
  const existingIndex = acc.findIndex(equalCards(card));
  if (existingIndex === -1) {
    return [...acc, card];
  }

  return acc.map((existingCard, index) => {
    if (index !== existingIndex) {
      return existingCard;
    }

    return {
      ...existingCard,
      definition: join([
        ...explode(existingCard.definition),
        ...explode(card.definition),
      ]),
    };
  });
};

type Payload = {
  collection: Collection<SrsCard>;
  analysisItems: AnalysisItem[];
  language: string;
};

export const createTranslationCards = ({
  collection,
  analysisItems,
  language,
}: Payload): TranslationCard[] => {
  return getCardCandidates(
    collection,
    analysisItems
      .map((analysisItem) =>
        analysisItemToCard({
          language,
          analysisItem,
        })
      )
      .reduce(combineCards, [])
  );
};
