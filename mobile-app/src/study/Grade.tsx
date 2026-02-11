import { CardItem, StudyFlowType } from '@vocably/model';
import { craftTheStrategy, SrsScore } from '@vocably/srs';
import React, { FC } from 'react';
import { ArrangeByLetters } from './ArrangeByLetters';
import { Card } from './Card';
import { MultiChoice } from './MultiChoice';
import { SwipeGrade } from './SwipeGrade';

type Props = {
  autoPlay: boolean;
  studySteps: StudyFlowType[];
  card: CardItem;
  onGrade: (score: SrsScore) => void;
  existingCards: CardItem[];
  prerenderedCards: CardItem[];
};

export const Grade: FC<Props> = ({
  card,
  studySteps,
  existingCards,
  autoPlay,
  onGrade,
  prerenderedCards,
}) => {
  const { immediateStep } = craftTheStrategy({
    studySteps,
    card,
    allCards: existingCards,
    prerenderedCards,
  });

  const strategyStep = () => {
    switch (immediateStep.step) {
      case 'sb':
        return (
          <SwipeGrade onGrade={onGrade} key={card.id}>
            <Card autoPlay={autoPlay} card={card} direction="back" />
          </SwipeGrade>
        );
      case 'mf':
        return (
          <MultiChoice
            key={card.id}
            autoPlay={autoPlay}
            card={card}
            alternatives={immediateStep.multiChoice}
            onGrade={onGrade}
            direction="front"
          />
        );
      case 'mb':
        return (
          <MultiChoice
            key={card.id}
            autoPlay={autoPlay}
            card={card}
            alternatives={immediateStep.multiChoice}
            onGrade={onGrade}
            direction="back"
          />
        );
      case 'ab':
        return <ArrangeByLetters key={card.id} card={card} onGrade={onGrade} />;
      default:
        return (
          <SwipeGrade onGrade={onGrade} key={card.id}>
            <Card autoPlay={autoPlay} card={card} direction="front" />
          </SwipeGrade>
        );
    }
  };

  return <>{strategyStep()}</>;
};
