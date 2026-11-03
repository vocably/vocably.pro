import { CardItem, SrsItem } from '@vocably/model';
import { createSrsItem } from './item';
import { isNotStarted, studyPlan } from './studyPlan';

const DAY = 86_400_000;
const today = new Date('2026-11-03T12:00:00.000Z');
const todayTs = Date.UTC(2026, 10, 3);
const tomorrowTs = todayTs + DAY;

let counter = 0;

const card = (id: string, data: Partial<SrsItem> = {}): CardItem => {
  counter += 1;
  return {
    id,
    created: counter,
    data: {
      language: 'en',
      source: id,
      definition: '',
      translation: '',
      partOfSpeech: '',
      example: '',
      tags: [],
      ...createSrsItem(),
      ...data,
    },
  } as CardItem;
};

// Studied at least once, so not considered new
const studied = (id: string, dueDate: number): CardItem =>
  card(id, { dueDate, interval: 1, repetition: 1 });

const neverStudied = (id: string, dueDate = todayTs - DAY): CardItem =>
  card(id, { dueDate });

const ids = (items: CardItem[]) => items.map((item) => item.id);

describe('studyPlan', () => {
  beforeEach(() => {
    counter = 0;
  });

  it('returns empty sections for an empty list', () => {
    expect(
      studyPlan({ today, list: [], maxCards: 10, maxNeverStudiedCards: 10 })
    ).toEqual({
      today: [],
      expired: [],
      notStarted: [],
      tomorrow: [],
      future: [],
    });
  });

  it('distributes cards between sections', () => {
    const list = [
      studied('due', todayTs),
      studied('expired', todayTs - DAY),
      neverStudied('new'),
      studied('tomorrow', tomorrowTs),
      studied('future', tomorrowTs + DAY),
    ];

    const plan = studyPlan({
      today,
      list,
      maxCards: 1,
      maxNeverStudiedCards: 10,
    });

    expect(ids(plan.today)).toEqual(['due']);
    expect(ids(plan.expired)).toEqual(['expired']);
    expect(ids(plan.notStarted)).toEqual(['new']);
    expect(ids(plan.tomorrow)).toEqual(['tomorrow']);
    expect(ids(plan.future)).toEqual(['future']);
  });

  it('fills today with due, then expired, then never studied cards', () => {
    const list = [
      neverStudied('new'),
      studied('expired', todayTs - DAY),
      studied('due', todayTs),
    ];

    const plan = studyPlan({
      today,
      list,
      maxCards: 10,
      maxNeverStudiedCards: 10,
    });

    expect(ids(plan.today)).toEqual(['due', 'expired', 'new']);
    expect(plan.expired).toEqual([]);
    expect(plan.notStarted).toEqual([]);
  });

  it('limits today with maxCards and keeps the rest in their sections', () => {
    const list = [
      studied('due1', todayTs),
      studied('due2', todayTs),
      studied('expired1', todayTs - DAY),
      studied('expired2', todayTs - 2 * DAY),
      neverStudied('new'),
    ];

    const plan = studyPlan({
      today,
      list,
      maxCards: 3,
      maxNeverStudiedCards: 10,
    });

    // due cards are sorted by creation date, newest first
    expect(ids(plan.today)).toEqual(['due2', 'due1', 'expired1']);
    expect(ids(plan.expired)).toEqual(['expired2']);
    expect(ids(plan.notStarted)).toEqual(['new']);
  });

  it('moves due today cards that do not fit into expired', () => {
    const list = [
      studied('due1', todayTs),
      studied('due2', todayTs),
      studied('expired', todayTs - DAY),
    ];

    const plan = studyPlan({
      today,
      list,
      maxCards: 1,
      maxNeverStudiedCards: 10,
    });

    expect(ids(plan.today)).toEqual(['due2']);
    expect(ids(plan.expired)).toEqual(['due1', 'expired']);
  });

  it('picks the most recently expired cards first', () => {
    const list = [
      studied('old', todayTs - 10 * DAY),
      studied('recent', todayTs - DAY),
      studied('middle', todayTs - 5 * DAY),
    ];

    const plan = studyPlan({
      today,
      list,
      maxCards: 2,
      maxNeverStudiedCards: 10,
    });

    expect(ids(plan.today)).toEqual(['recent', 'middle']);
    expect(ids(plan.expired)).toEqual(['old']);
  });

  it('limits never studied cards with maxNeverStudiedCards', () => {
    const list = [
      neverStudied('new1'),
      neverStudied('new2'),
      neverStudied('new3'),
    ];

    const plan = studyPlan({
      today,
      list,
      maxCards: 10,
      maxNeverStudiedCards: 2,
    });

    // never studied cards are sorted by creation date, newest first
    expect(ids(plan.today)).toEqual(['new3', 'new2']);
    expect(ids(plan.notStarted)).toEqual(['new1']);
  });

  it('limits never studied cards with the space left by maxCards', () => {
    const list = [
      studied('due', todayTs),
      neverStudied('new1'),
      neverStudied('new2'),
    ];

    const plan = studyPlan({
      today,
      list,
      maxCards: 2,
      maxNeverStudiedCards: 10,
    });

    expect(ids(plan.today)).toEqual(['due', 'new2']);
    expect(ids(plan.notStarted)).toEqual(['new1']);
  });

  it('counts never studied cards picked up today against the limit', () => {
    const list = [
      studied('pickedUp1', tomorrowTs),
      studied('pickedUp2', tomorrowTs),
      neverStudied('new1'),
      neverStudied('new2'),
    ];
    list[0].data.firstStudied = today.getTime() - 1000;
    list[1].data.firstStudied = today.getTime() - 2000;

    const plan = studyPlan({
      today,
      list,
      maxCards: 10,
      maxNeverStudiedCards: 3,
    });

    expect(ids(plan.today)).toEqual(['new2']);
    expect(ids(plan.notStarted)).toEqual(['new1']);
  });

  it('adds no never studied cards when the daily limit is reached', () => {
    const list = [studied('pickedUp', tomorrowTs), neverStudied('new')];
    list[0].data.firstStudied = today.getTime();

    const plan = studyPlan({
      today,
      list,
      maxCards: 10,
      maxNeverStudiedCards: 1,
    });

    expect(plan.today).toEqual([]);
    expect(ids(plan.notStarted)).toEqual(['new']);
  });

  it('treats today created cards simply as today', () => {
    const list = [neverStudied('newDueToday', todayTs), neverStudied('new')];

    const plan = studyPlan({
      today,
      list,
      maxCards: 10,
      maxNeverStudiedCards: 1,
    });

    expect(ids(plan.today)).toEqual(['new']);
    expect(ids(plan.notStarted)).toEqual(['newDueToday']);
  });

  it('puts nothing into today when maxCards is 0', () => {
    const list = [studied('due', todayTs), neverStudied('new')];

    const plan = studyPlan({
      today,
      list,
      maxCards: 0,
      maxNeverStudiedCards: 10,
    });

    expect(plan.today).toEqual([]);
    expect(ids(plan.expired)).toEqual(['due']);
    expect(ids(plan.notStarted)).toEqual(['new']);
  });

  it('puts every due card into today when maxCards is Infinity', () => {
    const list = [
      studied('due', todayTs),
      studied('expired', todayTs - DAY),
      neverStudied('new'),
    ];

    const plan = studyPlan({
      today,
      list,
      maxCards: Infinity,
      maxNeverStudiedCards: 0,
    });

    expect(ids(plan.today)).toEqual(['due', 'expired']);
    expect(plan.expired).toEqual([]);
    expect(ids(plan.notStarted)).toEqual(['new']);
  });

  it('sorts future cards by due date', () => {
    const list = [
      studied('far', tomorrowTs + 10 * DAY),
      studied('near', tomorrowTs + DAY),
    ];

    const plan = studyPlan({
      today,
      list,
      maxCards: 10,
      maxNeverStudiedCards: 10,
    });

    expect(ids(plan.future)).toEqual(['near', 'far']);
  });

  it('places every card in exactly one section', () => {
    const list = [
      studied('due1', todayTs),
      studied('due2', todayTs),
      studied('expired1', todayTs - DAY),
      studied('expired2', todayTs - 3 * DAY),
      neverStudied('new1'),
      neverStudied('new2'),
      studied('tomorrow', tomorrowTs),
      studied('future', tomorrowTs + DAY),
    ];

    const plan = studyPlan({
      today,
      list,
      maxCards: 3,
      maxNeverStudiedCards: 1,
    });

    const all = [
      ...plan.today,
      ...plan.expired,
      ...plan.notStarted,
      ...plan.tomorrow,
      ...plan.future,
    ];
    expect(ids(all).sort()).toEqual(ids(list).sort());
  });
});

describe('isNotStarted', () => {
  it('is true only for never studied cards due before today', () => {
    const notStarted = isNotStarted(today);

    expect(notStarted(neverStudied('new'))).toBe(true);
    expect(notStarted(neverStudied('newDueToday', todayTs))).toBe(false);
    expect(notStarted(studied('expired', todayTs - DAY))).toBe(false);
  });
});
