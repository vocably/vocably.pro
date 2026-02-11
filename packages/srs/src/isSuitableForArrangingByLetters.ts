import { CardItem } from '@vocably/model';

export const isSuitableForArrangingByLetters = (
  cardItem: CardItem
): boolean => {
  if (cardItem.data.language === 'zh' || cardItem.data.language === 'zh-TW') {
    return false;
  }

  if (cardItem.data.source.length <= 2) {
    return false;
  }

  if (cardItem.data.source.length > 16) {
    return false;
  }

  return true;
};
