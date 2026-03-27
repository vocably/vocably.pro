import { isItem } from '@vocably/crud';
import { TranslationCard } from '@vocably/model';

export const getSelectedTagIds = (
  cards: TranslationCard[],
  cardId: string
): string[] => {
  const card = cards.find((card) => isItem(card) && card.id === cardId);

  if (!card) {
    return [];
  }

  return card.data.tags.map((tag) => tag.id);
};
