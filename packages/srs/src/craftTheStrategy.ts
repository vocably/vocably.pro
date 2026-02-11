import { CardItem, StudyFlowType, StudyStrategy } from '@vocably/model';
import { getMultiChoice } from './getMultiChoice';
import { isSuitableForArrangingByLetters } from './isSuitableForArrangingByLetters';
import { spreadStrategy } from './spreadStrategy';

type SwipeFront = {
  step: 'sf';
};

type SwipeBack = {
  step: 'sb';
};

type MultiChoiceFront = {
  step: 'mf';
  multiChoice: [CardItem, CardItem, ...CardItem[]];
};

type MultiChoiceBack = {
  step: 'mb';
  multiChoice: [CardItem, CardItem, ...CardItem[]];
};

type ArrangeByLetters = {
  step: 'ab';
};

export type ImmediateStep =
  | SwipeFront
  | SwipeBack
  | MultiChoiceFront
  | MultiChoiceBack
  | ArrangeByLetters;

type Options = {
  studySteps: StudyFlowType[];
  card: CardItem;
  allCards: CardItem[];
  prerenderedCards: CardItem[];
};

type ReturnType = {
  strategy: StudyStrategy;
  immediateStep: ImmediateStep;
};

export const craftTheStrategy = ({
  studySteps,
  card,
  allCards,
  prerenderedCards,
}: Options): ReturnType => {
  const multiChoiceItems =
    getMultiChoice(card, allCards) ?? getMultiChoice(card, prerenderedCards);

  const filteredSteps = studySteps.filter((item) => {
    if (item.type === 'arrange' && !isSuitableForArrangingByLetters(card)) {
      return false;
    }

    if (
      item.type === 'multichoice' &&
      !card.data.translation &&
      !card.data.definition
    ) {
      return false;
    }

    if (item.type !== 'multichoice') {
      return true;
    }

    if (multiChoiceItems === null) {
      return false;
    }

    return true;
  });

  const swipeStrategy: StudyStrategy = [
    { step: 'sf', allowedFailures: null },
    { step: 'sb', allowedFailures: null },
  ];

  if (filteredSteps.length === 0) {
    const { currentState } = spreadStrategy(card.data.state, swipeStrategy);
    return {
      strategy: swipeStrategy,
      immediateStep: {
        step:
          currentState.s === 'sf' || currentState.s === 'sb'
            ? currentState.s
            : 'sf',
      },
    };
  }

  // @ts-ignore
  const strategy: StudyStrategy = filteredSteps.map((item) => {
    switch (item.id) {
      case 'mf':
        return { step: 'mf', allowedFailures: null };
      case 'sf':
        return { step: 'sf', allowedFailures: 0 };
      case 'mb':
        return { step: 'mb', allowedFailures: null };
      case 'ab':
        return { step: 'ab', allowedFailures: null };
      case 'sb':
        return { step: 'sb', allowedFailures: 0 };
      default:
        return { step: 'sf', allowedFailures: 0 };
    }
  });

  const { currentState } = spreadStrategy(card.data.state, strategy);
  return {
    strategy,
    immediateStep: {
      step: currentState.s,
      multiChoice: multiChoiceItems as [CardItem, CardItem, ...CardItem[]],
    },
  };
};
