import {
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
export const updateDetachedCard = ({
  translationCards,
  card,
  data,
}: Payload): Result<TranslationCards> => {
  return {
    success: true,
    value: {
      ...translationCards,
      items: translationCards.items.map((item) => {
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
      }),
    },
  };
};
