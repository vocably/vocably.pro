import { byDate, CardItem } from '@vocably/model';
import { isToday } from '@vocably/sulna';
import { isNew } from './isNew';

export type StudyPlan = {
  today: CardItem[];
  expired: CardItem[];
  notStarted: CardItem[];
  tomorrow: CardItem[];
  future: CardItem[];
};

export type StudyPlanOptions = {
  today: Date;
  list: CardItem[];
  maxCards: number;
  maxNeverStudiedCards: number;
};

const startOfUtcDay = (date: Date, dayOffset = 0): number =>
  Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate() + dayOffset
  );

/**
 * Whether the card belongs to the never studied cards of the plan, as
 * opposed to cards that are due (today or expired).
 */
export const isNotStarted =
  (today: Date) =>
  (item: CardItem): boolean =>
    item.data.dueDate < startOfUtcDay(today) && isNew(item);

const countNewCardsPickedUpToday = (list: CardItem[], today: Date): number =>
  list.filter(
    (item) =>
      item.data.firstStudied !== undefined &&
      isToday(item.data.firstStudied, today)
  ).length;

/**
 * Splits the list into plan sections. `today` holds the cards to study
 * today, picked the same way `slice` picks a session:
 *
 * 1. cards due today,
 * 2. expired cards, most recently due first,
 * 3. never studied cards, newest first, as long as fewer than
 *    `maxNeverStudiedCards` were picked up today,
 *
 * up to `maxCards` in total. Due cards that do not fit stay in `expired`,
 * new cards that do not fit stay in `notStarted`. Every card ends up in
 * exactly one section.
 */
export const studyPlan = ({
  today,
  list,
  maxCards,
  maxNeverStudiedCards,
}: StudyPlanOptions): StudyPlan => {
  const todayTs = startOfUtcDay(today);
  const tomorrowTs = startOfUtcDay(today, 1);

  const dueToday: CardItem[] = [];
  const expired: CardItem[] = [];
  const notStarted: CardItem[] = [];
  const tomorrow: CardItem[] = [];
  const future: CardItem[] = [];

  list.forEach((item) => {
    if (isNew(item)) {
      notStarted.push(item);
    } else if (item.data.dueDate === todayTs) {
      dueToday.push(item);
    } else if (item.data.dueDate === tomorrowTs) {
      tomorrow.push(item);
    } else if (item.data.dueDate > todayTs) {
      future.push(item);
    } else {
      expired.push(item);
    }
  });

  dueToday.sort(byDate);
  expired.sort((a, b) => b.data.dueDate - a.data.dueDate);
  notStarted.sort((a, b) => b.created - a.created);
  future.sort((a, b) => a.data.dueDate - b.data.dueDate);

  const limit = Math.max(0, maxCards);
  const due = [...dueToday, ...expired];
  const todayCards = due.slice(0, limit);

  const newCardsAllowance = Math.max(
    0,
    Math.min(
      limit - todayCards.length,
      maxNeverStudiedCards - countNewCardsPickedUpToday(list, today)
    )
  );
  todayCards.push(...notStarted.slice(0, newCardsAllowance));

  return {
    today: todayCards,
    expired: due.slice(limit),
    notStarted: notStarted.slice(newCardsAllowance),
    tomorrow,
    future,
  };
};
