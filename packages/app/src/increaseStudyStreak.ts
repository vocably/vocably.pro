import { Result, StudyStreak } from '@vocably/model';
import { fetchStudyStreak, putStudyStreak } from '@vocably/api';
import { dateToString } from '@vocably/sulna';
import { setStreak } from '@vocably/model-operations';

export const increaseStudyStreak = async (): Promise<Result<StudyStreak>> => {
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

  const putResult = await putStudyStreak(toBeSaved);
  if (putResult.success === false) {
    return putResult;
  }

  return {
    success: true,
    value: toBeSaved,
  };
};
