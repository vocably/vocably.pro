import { Result } from '@vocably/model';
import { fetchStudyStreak, putStudyStreak } from '@vocably/api';
import { dateToString } from '@vocably/sulna';
import { setStreak } from '@vocably/model-operations';

export const increaseStudyStreak = async (): Promise<Result<unknown>> => {
  const studyStreakResult = await fetchStudyStreak();
  if (studyStreakResult.success === false) {
    return studyStreakResult;
  }

  const today = dateToString(new Date());
  const toBeSaved = setStreak(
    studyStreakResult.value,
    today,
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  return putStudyStreak(toBeSaved);
};
