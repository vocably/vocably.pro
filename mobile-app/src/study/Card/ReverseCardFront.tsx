import { CardItem, DeckSettings } from '@vocably/model';
import { explode, join } from '@vocably/sulna';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { StudyCardDefinition } from '../StudyCardDefinition';
import { CardExample, CardExampleRef, Mask } from '../../CardExample';
import { studySmallFontSize } from '../../styles';
import { SectionLabel } from './SectionLabel';
import { maskTheWord } from '../../maskTheWord';

export type ReverseCardFrontRef = {
  playExample: () => Promise<void>;
};

type Props = {
  card: CardItem;
  hasChecked: boolean;
  onPress?: () => unknown;
  deckSettings: DeckSettings;
};

export const ReverseCardFront = forwardRef<ReverseCardFrontRef, Props>(
  ({ card, hasChecked, onPress, deckSettings }, ref) => {
    const { t } = useTranslation();

    let examples = card.data.example ? explode(card.data.example) : [];

    let mask: Mask | undefined = undefined;
    if (!hasChecked) {
      mask = {
        text: card.data.source,
        language: card.data.language,
      };

      // CardExample hides examples that can't be masked
      const maskExample = maskTheWord(mask.text, mask.language);
      examples = examples.filter((example) => maskExample(example).masked);
    }

    const cardExampleRef = useRef<CardExampleRef>(null);

    useImperativeHandle(ref, () => ({
      playExample: async () => {
        await cardExampleRef.current?.play();
      },
    }));

    return (
      <View>
        <StudyCardDefinition
          card={card.data}
          maskSource={!hasChecked}
          onPress={onPress}
          hideDefinitions={deckSettings.hideDefinitions}
          enrichWithPartOfSpeech={true}
        />
        {examples.length > 0 && (
          <View style={{ marginTop: 24 }}>
            <SectionLabel style={{ marginBottom: 6 }}>
              {t('study.reverseCardFront.examples', {
                count: examples.length,
              })}
            </SectionLabel>
            <CardExample
              ref={cardExampleRef}
              mask={mask}
              example={join(examples)}
              language={card.data.language}
              textStyle={{ fontSize: studySmallFontSize }}
              onPress={onPress}
              hideBul={true}
            />
          </View>
        )}
      </View>
    );
  }
);
