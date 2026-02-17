export type StreakDay = {
  day: number;
  checked: boolean;
};

const getWeek = (country: string): number[] => {
  if (
    [
      'US', // United States
      'CA', // Canada
      'AU', // Australia
      'PH', // Philippines
      'AE', // United Arab Emirates
      'MX', // Mexico
      'IL', // Israel
      'SA', // Saudi Arabia
      'EG', // Egypt
      'JO', // Jordan
      'KW', // Kuwait
      'QA', // Qatar
      'BH', // Bahrain
      'OM', // Oman
    ].includes(country)
  ) {
    return [0, 1, 2, 3, 4, 5, 6];
  }

  if (['AF', 'IR'].includes(country)) {
    return [6, 0, 1, 2, 3, 4, 5];
  }

  return [1, 2, 3, 4, 5, 6, 0];
};

export const getStreakDays = (
  consecutiveDays: number,
  today: Date,
  country: string
): StreakDay[] => {
  const week = getWeek(country);
  if (consecutiveDays === 0) {
    return week.map((day) => ({
      day,
      checked: false,
    }));
  }

  if (consecutiveDays < 7) {
    const startDate = new Date(today.getTime());
    startDate.setDate(startDate.getDate() - consecutiveDays + 1);
    return [0, 1, 2, 3, 4, 5, 6].map((weekDay, index) => {
      const streakDay = new Date(startDate.getTime());
      streakDay.setDate(streakDay.getDate() + weekDay);

      return {
        day: streakDay.getDay(),
        checked: index < consecutiveDays,
      };
    });
  }

  let isChecked = true;
  return week.map((weekDay, index) => {
    const result = {
      day: weekDay,
      checked: isChecked,
    };

    if (weekDay === today.getDay()) {
      isChecked = false;
    }

    return result;
  });
};
