import {
  AnalysisItem,
  Card,
  DetachedCardItem,
  Result,
  TranslationCards,
} from '@vocably/model';
import { analysisItemToCard } from './analysisItemToCard';
import { equalCards } from './compareCards';

type Payload = {
  card: DetachedCardItem;
  data: Partial<Card>;
  translationCards: TranslationCards;
};

const makeUpdateItem =
  ({ card, data, translationCards }: Payload) =>
  (item: AnalysisItem): AnalysisItem => {
    const analysisCard = analysisItemToCard({
      language: translationCards.sourceLanguage,
      analysisItem: item,
    });
    if (equalCards(card.data)(analysisCard)) {
      return {
        ...item,
        ...data,
      };
    }
    return item;
  };
export const updateDetachedCard = ({
  translationCards,
  card,
  data,
}: Payload): Result<TranslationCards> => {
  const updateItem = makeUpdateItem({ card, data, translationCards });
  return {
    success: true,
    value: {
      ...translationCards,
      items: translationCards.items.map(updateItem),
      extraItems: (translationCards.extraItems ?? []).map(updateItem),
    },
  };
};
