export interface StudySettings {
  cardsPerSession: number;
  random: boolean;
}

const STUDY_SETTINGS_KEY = 'studySettings';

export function getStudySettings(): StudySettings {
  const stored = localStorage.getItem(STUDY_SETTINGS_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return {
        cardsPerSession:
          typeof parsed.cardsPerSession === 'number'
            ? parsed.cardsPerSession
            : 10,
        random: typeof parsed.random === 'boolean' ? parsed.random : false,
      };
    } catch (e) {
      console.error('Failed to parse study settings', e);
    }
  }
  return {
    cardsPerSession: 10,
    random: false,
  };
}

export function setStudySettings(settings: StudySettings): void {
  localStorage.setItem(STUDY_SETTINGS_KEY, JSON.stringify(settings));
}
