import { CardItem } from '@vocably/model';
import { dateToString, isToday } from '@vocably/sulna';

const NEW_CARDS_STUDIED_KEY = 'newCardsStudiedToday';

type NewCardsStudied = {
  date: string;
  ids: string[];
};

const today = () => dateToString(new Date());

const read = (): NewCardsStudied => {
  const date = today();
  const stored = localStorage.getItem(NEW_CARDS_STUDIED_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.date === date && Array.isArray(parsed.ids)) {
        return { date, ids: parsed.ids };
      }
    } catch (e) {
      console.error('Failed to parse new cards studied today', e);
    }
  }

  return { date, ids: [] };
};

export const isNeverStudied = (cardItem: CardItem): boolean =>
  !cardItem.data.firstStudied && !cardItem.data.lastStudied;

export const trackNewCardStudied = (cardItem: CardItem): void => {
  const value = read();
  if (value.ids.includes(cardItem.id)) {
    return;
  }

  value.ids.push(cardItem.id);
  localStorage.setItem(NEW_CARDS_STUDIED_KEY, JSON.stringify(value));
};

const isFirstStudiedToday = (cardItem: CardItem): boolean =>
  !!cardItem.data.firstStudied &&
  dateToString(new Date(cardItem.data.firstStudied)) === today();

/**
 * The `slice` function from `@vocably/srs` subtracts the number of cards in
 * `deckCards` that were first studied today from the limit it receives. This
 * returns the limit to pass to `slice` so that the remaining allowance is
 * `maxNewCardsPerDay` minus the cards studied today across all decks.
 */
export const getNewCardsSliceLimit = (
  maxNewCardsPerDay: number,
  deckCards: CardItem[]
): number => {
  const studiedToday = new Set([
    ...read().ids,
    ...deckCards.filter(isFirstStudiedToday).map((card) => card.id),
  ]);

  const remaining = Math.max(0, maxNewCardsPerDay - studiedToday.size);

  // Mirror exactly what `slice` subtracts so it cancels out.
  const subtractedBySlice = deckCards.filter((card) =>
    isToday(card.data.firstStudied)
  ).length;

  return remaining + subtractedBySlice;
};
