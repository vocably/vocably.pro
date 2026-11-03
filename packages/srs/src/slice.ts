import { CardItem } from '@vocably/model';
import { shuffle } from 'lodash-es';
import { isNotStarted, studyPlan } from './studyPlan';

export const STUDY_DELAY_MS = 1_800_000; // 1_800_000 is 30 minutes in milliseconds

export const hasStudied =
  (now: number) =>
  (item: CardItem): boolean => {
    if (!item.data.lastStudied) {
      return true;
    }

    return now - item.data.lastStudied > STUDY_DELAY_MS;
  };

export const slice = (
  today: Date,
  maxCards: number,
  maxNeverStudiedCards: number,
  list: CardItem[],
  planSection?: string
): CardItem[] => {
  if (list.length === 0) {
    return [];
  }

  const plan = studyPlan({ today, list, maxCards, maxNeverStudiedCards });

  const now = new Date().getTime();

  if (planSection && plan[planSection]) {
    const candidates = shuffle(plan[planSection].filter(hasStudied(now)));
    if (candidates.length > 0) {
      return candidates.slice(0, maxCards);
    }

    return shuffle(plan[planSection]).slice(0, maxCards);
  }

  if (plan.today.length > 0) {
    // Due cards come in random order, never studied cards go last
    const notStarted = isNotStarted(today);

    return [
      ...shuffle(plan.today.filter((item) => !notStarted(item))),
      ...plan.today.filter(notStarted),
    ];
  }

  const tomorrowCandidates = shuffle(plan.tomorrow.filter(hasStudied(now)));

  if (tomorrowCandidates.length > 0) {
    return tomorrowCandidates.slice(0, maxCards);
  }

  const futureCards = shuffle(plan.tomorrow).concat(plan.future);

  let futureCandidates = futureCards.filter(hasStudied(now));
  if (futureCandidates.length === 0) {
    futureCandidates = futureCards;
  }

  return futureCandidates.slice(0, maxCards);
};
