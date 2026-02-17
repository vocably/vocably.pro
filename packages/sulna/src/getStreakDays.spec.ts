import { getStreakDays } from './getStreakDays';

const wednesday = new Date(2025, 3, 16);
describe('streakDays', () => {
  it('works with zero streak days', () => {
    const days = getStreakDays(0, wednesday, 'US');
    expect(days).toEqual([
      { day: 0, checked: false },
      { day: 1, checked: false },
      { day: 2, checked: false },
      { day: 3, checked: false },
      { day: 4, checked: false },
      { day: 5, checked: false },
      { day: 6, checked: false },
    ]);
  });

  it('works with streak days less than one week US', () => {
    const days = getStreakDays(5, wednesday, 'US');
    expect(days).toEqual([
      { day: 6, checked: true },
      { day: 0, checked: true },
      { day: 1, checked: true },
      { day: 2, checked: true },
      { day: 3, checked: true },
      { day: 4, checked: false },
      { day: 5, checked: false },
    ]);
  });

  it('works with streak days more than one week US', () => {
    const days = getStreakDays(8, wednesday, 'US');
    expect(days).toEqual([
      { day: 0, checked: true },
      { day: 1, checked: true },
      { day: 2, checked: true },
      { day: 3, checked: true },
      { day: 4, checked: false },
      { day: 5, checked: false },
      { day: 6, checked: false },
    ]);
  });

  it('works with streak days more than one week DE', () => {
    const days = getStreakDays(8, wednesday, 'DE');
    expect(days).toEqual([
      { day: 1, checked: true },
      { day: 2, checked: true },
      { day: 3, checked: true },
      { day: 4, checked: false },
      { day: 5, checked: false },
      { day: 6, checked: false },
      { day: 0, checked: false },
    ]);
  });
});
