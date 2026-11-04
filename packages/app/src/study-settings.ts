export interface StudySettings {
  cardsPerSession: number;
  random: boolean;
  maxNewCardsPerDay: number;
}

const STUDY_SETTINGS_KEY = 'studySettings';

const defaultStudySettings: StudySettings = {
  cardsPerSession: 100,
  random: false,
  maxNewCardsPerDay: 40,
};

export function getStudySettings(): StudySettings {
  const stored = localStorage.getItem(STUDY_SETTINGS_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return {
        cardsPerSession:
          typeof parsed.cardsPerSession === 'number'
            ? parsed.cardsPerSession
            : defaultStudySettings.cardsPerSession,
        random:
          typeof parsed.random === 'boolean'
            ? parsed.random
            : defaultStudySettings.random,
        maxNewCardsPerDay:
          typeof parsed.maxNewCardsPerDay === 'number'
            ? parsed.maxNewCardsPerDay
            : defaultStudySettings.maxNewCardsPerDay,
      };
    } catch (e) {
      console.error('Failed to parse study settings', e);
    }
  }
  return { ...defaultStudySettings };
}

export function setStudySettings(settings: StudySettings): void {
  localStorage.setItem(STUDY_SETTINGS_KEY, JSON.stringify(settings));
}
