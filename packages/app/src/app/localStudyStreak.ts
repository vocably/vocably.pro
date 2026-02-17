import { defaultStudyStreak, StudyStreak } from '@vocably/model';

const COLLECTION = 'lastStudyStreak';

export const getLastStudyStreak = (): StudyStreak => {
  const item = localStorage.getItem(COLLECTION);
  if (item) {
    return JSON.parse(item);
  }

  return defaultStudyStreak;
};

export const saveLastStudyStreak = (studyStreak: StudyStreak) => {
  localStorage.setItem(COLLECTION, JSON.stringify(studyStreak));
};
