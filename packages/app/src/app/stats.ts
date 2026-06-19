type Stats = {
  installedDateIso?: string;
  isLoggedIn?: boolean;
  studyLanguage?: string;
  nativeLanguage?: string;
};

const STATS_KEY = 'stats';

export const setStats = (stats: Partial<Stats>) => {
  const existing = getStats() ?? {};

  const next: Stats = {
    ...existing,
    ...stats,
    // Do not reset installedDateIso if it is already set.
    installedDateIso: existing.installedDateIso ?? stats.installedDateIso,
  };

  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(next));
  } catch (e) {}
};

export const getStats = (): Stats | undefined => {
  try {
    const raw = localStorage.getItem(STATS_KEY);

    if (!raw) {
      return undefined;
    }

    return JSON.parse(raw) as Stats;
  } catch (e) {
    return undefined;
  }
};
