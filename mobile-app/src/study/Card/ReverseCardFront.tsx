import { CardItem, DeckSettings } from '@vocably/model';
import { explode, join } from '@vocably/sulna';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { View } from 'react-native';
import { Trans, useTranslation } from 'react-i18next';
import { Text, useTheme } from 'react-native-paper';
import { CardDefinition } from '../../CardDefinition';
import { CardExample, CardExampleRef, Mask } from '../../CardExample';
import { studySmallFontSize } from '../../styles';

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
    }

    const cardExampleRef = useRef<CardExampleRef>(null);

    useImperativeHandle(ref, () => ({
      playExample: async () => {
        await cardExampleRef.current?.play();
      },
    }));

    return (
      <View>
        <CardDefinition
          card={card.data}
          textStyle={{ fontSize: 24 }}
          maskSource={!hasChecked}
          onPress={onPress}
          hideDefinitions={deckSettings.hideDefinitions}
          enrichWithPartOfSpeech={true}
          partOfSpeechFontSize={studySmallFontSize}
        />
        {examples.length > 0 && (
          <>
            <Text
              style={{
                fontSize: 24,
                marginTop: 12,
                marginBottom: 12,
              }}
            >
              {t('study.reverseCardFront.examples', {
                count: examples.length,
              })}
            </Text>
            <CardExample
              ref={cardExampleRef}
              mask={mask}
              example={join(examples)}
              language={card.data.language}
              textStyle={{ fontSize: studySmallFontSize }}
              onPress={onPress}
            />
          </>
        )}
      </View>
    );
  }
);
