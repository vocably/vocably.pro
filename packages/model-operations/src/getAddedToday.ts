import { CardItem } from '@vocably/model';

export const getAddedToday = (cards: CardItem[], today: Date): CardItem[] => {
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 1, 0, 0);
  const startOfDayMs = startOfDay.getTime();
  return cards.filter((card) => card.created >= startOfDayMs);
};
