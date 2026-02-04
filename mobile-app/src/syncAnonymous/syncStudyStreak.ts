import { fetchStudyStreak, putStudyStreak } from '@vocably/api';
import { Result, StudyStreak } from '@vocably/model';

export const syncStudyStreak = async (
  fromStudyStreak: StudyStreak
): Promise<Result<StudyStreak>> => {
  const currentStudyStreak = await fetchStudyStreak();
  if (currentStudyStreak.success === false) {
    return currentStudyStreak;
  }

  let newStudyStreak: StudyStreak = {
    ...currentStudyStreak.value,
  };

  if (currentStudyStreak.value.longestStreak < fromStudyStreak.longestStreak) {
    newStudyStreak = {
      ...fromStudyStreak,
    };
  }

  const putResult = await putStudyStreak(newStudyStreak);

  if (putResult.success === false) {
    return putResult;
  }

  return {
    success: true,
    value: newStudyStreak,
  };
};
