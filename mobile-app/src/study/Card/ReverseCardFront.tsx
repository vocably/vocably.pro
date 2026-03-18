import { CardItem } from '@vocably/model';
import { explode, join } from '@vocably/sulna';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { CardDefinition } from '../../CardDefinition';
import { CardExample, CardExampleRef, Mask } from '../../CardExample';

export type ReverseCardFrontRef = {
  playExample: () => Promise<void>;
};

type Props = { card: CardItem; hasChecked: boolean; requiredAction?: string };

export const ReverseCardFront = forwardRef<ReverseCardFrontRef, Props>(
  ({ card, hasChecked, requiredAction = 'Guess' }, ref) => {
    const theme = useTheme();

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
        <Text style={{ fontSize: 24, marginBottom: 12 }}>
          {requiredAction} the{' '}
          {card.data.partOfSpeech ? (
            <Text style={{ color: theme.colors.secondary }}>
              {card.data.partOfSpeech}
            </Text>
          ) : (
            'meaning'
          )}
          {':'}
        </Text>
        <CardDefinition
          card={card.data}
          textStyle={{ fontSize: 24 }}
          maskSource={!hasChecked}
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
              Example{examples.length > 1 ? 's' : ''}:
            </Text>
            <CardExample
              ref={cardExampleRef}
              mask={mask}
              example={join(examples)}
              language={card.data.language}
              textStyle={{ fontSize: 18 }}
            />
          </>
        )}
      </View>
    );
  }
);
