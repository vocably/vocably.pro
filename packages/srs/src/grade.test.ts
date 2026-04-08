import { StudyStrategy } from '@vocably/model';
import { buildDueDate } from './dueDate';
import { grade } from './grade';
import { createSrsItem } from './item';

describe('grade', () => {
  it('should ask a good card in 6 days of good responses', () => {
    let item = createSrsItem();
    const strategy: StudyStrategy = [
      { step: 'mf', allowedFailures: null },
      { step: 'sf', allowedFailures: 0 },
      { step: 'mb', allowedFailures: null },
      { step: 'sb', allowedFailures: 0 },
    ];

    item = grade(item, 5, strategy);
    expect(item.repetition).toEqual(1);
    expect(item.interval).toEqual(1);
    expect(item.state.s).toEqual('sf');

    item = grade(item, 5, strategy);
    expect(item.repetition).toEqual(2);
    expect(item.interval).toEqual(1);
    expect(item.state.s).toEqual('mb');

    item = grade(item, 5, strategy);
    expect(item.repetition).toEqual(3);
    expect(item.interval).toEqual(1);
    expect(item.state.s).toEqual('sb');

    item = grade(item, 5, strategy);
    expect(item.repetition).toEqual(4);
    expect(item.interval).toEqual(3);
    expect(item.state.s).toEqual('mf');
  });

  it('should reduce efactor and not change card state on 3', () => {
    let item = createSrsItem();
    item.state = {
      s: 'sb',
      f: 0,
    };
    item.eFactor = 2.5;
    item.interval = 4;
    item.repetition = 5;

    const strategy: StudyStrategy = [
      { step: 'mf', allowedFailures: null },
      { step: 'sf', allowedFailures: 0 },
      { step: 'mb', allowedFailures: null },
      { step: 'sb', allowedFailures: 0 },
    ];

    item = grade(item, 3, strategy);
    expect(item.repetition).toEqual(5);
    expect(item.interval).toEqual(4);
    expect(item.state.s).toEqual('sb');
    expect(item.eFactor).toEqual(2.36);
    expect(item.dueDate).toEqual(buildDueDate(1));
  });

  it('should move on to the next interval when total successful repetitions are more than twice of strategy items', () => {
    let item = createSrsItem();
    item.state = {
      s: 'mb',
      f: 0,
    };
    item.eFactor = 2.5;
    item.interval = 6;
    item.repetition = 8;

    const strategy: StudyStrategy = [
      { step: 'mf', allowedFailures: null },
      { step: 'sf', allowedFailures: 0 },
      { step: 'mb', allowedFailures: null },
      { step: 'sb', allowedFailures: 0 },
    ];

    item = grade(item, 5, strategy);
    expect(item.repetition).toEqual(9);
    expect(item.interval).toEqual(6);
    expect(item.state.s).toEqual('sb');
    expect(item.eFactor).toEqual(2.5);
    expect(item.dueDate).toEqual(buildDueDate(1));
  });

  it('should not depreciate future cards when 5', () => {
    const now = new Date();
    const nextWeekTs = Date.UTC(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 7
    );

    let item = createSrsItem();
    item.state = {
      s: 'mb',
      f: 0,
    };
    item.eFactor = 2.5;
    item.interval = 6;
    item.repetition = 4;
    item.dueDate = nextWeekTs;

    const strategy: StudyStrategy = [
      { step: 'mf', allowedFailures: null },
      { step: 'sf', allowedFailures: 0 },
      { step: 'mb', allowedFailures: null },
      { step: 'sb', allowedFailures: 0 },
    ];

    item = grade(item, 5, strategy, now);

    expect(item.repetition).toEqual(5);
    expect(item.interval).toEqual(6);
    expect(item.eFactor).toEqual(2.5);
    expect(item.dueDate).toEqual(nextWeekTs);
  });

  it('should not depreciate future cards when 3', () => {
    const now = new Date();
    const nextWeekTs = Date.UTC(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 7
    );

    let item = createSrsItem();
    item.state = {
      s: 'mb',
      f: 0,
    };
    item.eFactor = 2.5;
    item.interval = 6;
    item.repetition = 4;
    item.dueDate = nextWeekTs;

    const strategy: StudyStrategy = [
      { step: 'mf', allowedFailures: null },
      { step: 'sf', allowedFailures: 0 },
      { step: 'mb', allowedFailures: null },
      { step: 'sb', allowedFailures: 0 },
    ];

    item = grade(item, 3, strategy, now);

    expect(item.repetition).toEqual(4);
    expect(item.interval).toEqual(6);
    expect(item.eFactor).toEqual(2.36);
    expect(item.dueDate).toEqual(nextWeekTs);
  });

  it('should consider that the card is new but from the future', () => {
    const now = new Date();
    const oneDayTs = Date.UTC(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1
    );
    const threeDaysTs = Date.UTC(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 3
    );

    let item = createSrsItem();
    item.state = {
      s: 'sb',
      f: 0,
    };
    item.eFactor = 2.5;
    item.interval = 1;
    item.repetition = 3;
    item.dueDate = oneDayTs;

    const strategy: StudyStrategy = [
      { step: 'mf', allowedFailures: null },
      { step: 'sf', allowedFailures: 0 },
      { step: 'mb', allowedFailures: null },
      { step: 'sb', allowedFailures: 0 },
    ];

    item = grade(item, 5, strategy, now);

    expect(item.repetition).toEqual(4);
    expect(item.interval).toEqual(3);
    expect(item.eFactor).toEqual(2.58);
    expect(item.dueDate).toEqual(threeDaysTs);
  });

  it('should consider that the card is old and from the future', () => {
    const now = new Date();
    const threeDaysTs = Date.UTC(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 3
    );

    let item = createSrsItem();
    item.state = {
      s: 'sf',
      f: 0,
    };
    item.eFactor = 2.5;
    item.interval = 15;
    item.repetition = 10;
    item.dueDate = threeDaysTs;

    const strategy: StudyStrategy = [
      { step: 'mf', allowedFailures: null },
      { step: 'sf', allowedFailures: 0 },
      { step: 'mb', allowedFailures: null },
      { step: 'sb', allowedFailures: 0 },
    ];

    item = grade(item, 5, strategy, now);

    expect(item.repetition).toEqual(11);
    expect(item.eFactor).toEqual(2.58);
    expect(item.interval).toEqual(35);
    expect(item.dueDate).toEqual(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + 35)
    );
  });

  it('should consider that the card is old and from the future, but weak', () => {
    const now = new Date();
    const threeDaysTs = Date.UTC(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 3
    );

    let item = createSrsItem();
    item.state = {
      s: 'mf',
      f: 0,
    };
    item.eFactor = 2.5;
    item.interval = 15;
    item.repetition = 10;
    item.dueDate = threeDaysTs;

    const strategy: StudyStrategy = [
      { step: 'mf', allowedFailures: null },
      { step: 'sf', allowedFailures: 0 },
      { step: 'mb', allowedFailures: null },
      { step: 'sb', allowedFailures: 0 },
    ];

    item = grade(item, 5, strategy, now);

    expect(item.repetition).toEqual(11);
    expect(item.eFactor).toEqual(2.5);
    expect(item.interval).toEqual(15);
    expect(item.dueDate).toEqual(threeDaysTs);
  });

  it('should see a weak as strong option of there are no strong queued', () => {
    const now = new Date();
    const threeDaysTs = Date.UTC(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 3
    );

    let item = createSrsItem();
    item.state = {
      s: 'mf',
      f: 0,
    };
    item.eFactor = 2.5;
    item.interval = 15;
    item.repetition = 10;
    item.dueDate = threeDaysTs;

    const strategy: StudyStrategy = [
      { step: 'mf', allowedFailures: null },
      { step: 'mb', allowedFailures: null },
    ];

    item = grade(item, 5, strategy, now);

    expect(item.repetition).toEqual(11);
    expect(item.eFactor).toEqual(2.53);
    expect(item.interval).toEqual(35);
    expect(item.dueDate).toEqual(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + 35)
    );
  });
});
