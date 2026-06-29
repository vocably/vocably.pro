import { CardItem } from '@vocably/model';
import { LanguageTagStorage } from './tagsStorage';

export const filterByTags = (
  cards: CardItem[],
  tagStorage: LanguageTagStorage
) => {
  if (tagStorage.noTags) {
    return cards.filter((card) => card.data.tags.length === 0);
  }

  if (tagStorage.tagIds.length === 0) {
    return cards;
  }

  return cards.filter((card) =>
    card.data.tags.some((tag) => tagStorage.tagIds.includes(tag.id))
  );
};
