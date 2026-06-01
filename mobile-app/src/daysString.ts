import { calculateDays } from '@vocably/sulna';
import i18n from './i18n';

export const daysString = (todayTs: number, dueDate: number): string => {
  const days = calculateDays(todayTs, dueDate);

  if (days === 1) {
    return i18n.t('dashboard.dueDate.tomorrow');
  } else {
    return i18n.t('dashboard.dueDate.inDays', { count: days });
  }
};
