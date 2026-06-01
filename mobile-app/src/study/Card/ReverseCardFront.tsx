import { CardItem, DeckSettings } from '@vocably/model';
import { explode, join } from '@vocably/sulna';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { View } from 'react-native';
import { Trans, useTranslation } from 'react-i18next';
import { Text, useTheme } from 'react-native-paper';
import { CardDefinition } from '../../CardDefinition';
import { CardExample, CardExampleRef, Mask } from '../../CardExample';

export type ReverseCardFrontRef = {
  playExample: () => Promise<void>;
};

type Props = {
  card: CardItem;
  hasChecked: boolean;
  requiredAction?: string;
  onPress?: () => unknown;
  deckSettings: DeckSettings;
};

export const ReverseCardFront = forwardRef<ReverseCardFrontRef, Props>(
  ({ card, hasChecked, requiredAction, onPress, deckSettings }, ref) => {
    const theme = useTheme();
    const { t } = useTranslation();
    const actionText = requiredAction ?? t('study.reverseCardFront.guess');

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
          <Trans
            i18nKey="study.reverseCardFront.actionForPartOfSpeech"
            values={{
              action: actionText,
              partOfSpeech: card.data.partOfSpeech
                ? t(
                    `language.${card.data.partOfSpeech}`,
                    card.data.partOfSpeech
                  )
                : t('study.reverseCardFront.meaning'),
            }}
            components={{
              highlighted: card.data.partOfSpeech ? (
                <Text style={{ color: theme.colors.secondary }} />
              ) : (
                <Text />
              ),
            }}
          />
        </Text>
        <CardDefinition
          card={card.data}
          textStyle={{ fontSize: 24 }}
          maskSource={!hasChecked}
          onPress={onPress}
          hideDefinitions={deckSettings.hideDefinitions}
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
              textStyle={{ fontSize: 18 }}
              onPress={onPress}
            />
          </>
        )}
      </View>
    );
  }
);
