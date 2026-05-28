import { CardItem, DeckSettings, isGoogleTTSLanguage } from '@vocably/model';
import { isGoodPlural, sanitizeTranscript } from '@vocably/sulna';
import React, { FC, useEffect, useRef, useState } from 'react';
import { PixelRatio, Platform, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text, useTheme } from 'react-native-paper';
import { CardExample, CardExampleRef } from '../../CardExample';
import { PlaySound, PlaySoundRef } from '../../PlaySound';

type Props = {
  card: CardItem;
  autoPlay: boolean;
  playRandomExample: boolean;
  showInflections?: boolean;
  onPress?: () => unknown;
  deckSettings: DeckSettings;
};

export const CardFront: FC<Props> = ({
  card,
  autoPlay,
  playRandomExample,
  showInflections = false,
  onPress,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const [isAutoPlayed, setIsAutoPlayed] = useState(false);
  const playRef = useRef<PlaySoundRef>(null);
  const cardExampleRef = useRef<CardExampleRef>(null);

  useEffect(() => {
    if (!autoPlay) {
      return;
    }

    if (isAutoPlayed) {
      return;
    }

    if (!playRef.current) {
      return;
    }

    playRef.current.play().then(() => {
      if (cardExampleRef.current && playRandomExample) {
        cardExampleRef.current.play();
      }
    });
    setIsAutoPlayed(true);
  }, [isAutoPlayed, autoPlay]);

  const fontScale = PixelRatio.getFontScale();

  const present = card.data.presentTenses
    ? t('study.cardFront.presentTenses', { value: card.data.presentTenses })
    : false;
  const past =
    card.data.tense === 'present' && card.data.pastTenses
      ? t('study.cardFront.pastTenses', { value: card.data.pastTenses })
      : false;

  const presentAndPast = [present, past].filter(Boolean).join(`\n`);

  return (
    <View>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'baseline',
          flexWrap: 'wrap',
          width: '100%',
        }}
      >
        <Text
          style={{
            fontSize: 18,
            textAlignVertical: 'top',
          }}
        >
          {isGoogleTTSLanguage(card.data.language) && (
            <>
              <PlaySound
                text={card.data.source}
                language={card.data.language}
                size={24}
                ref={playRef}
                style={{
                  transform: [
                    {
                      translateY:
                        Platform.OS === 'ios'
                          ? -1 * fontScale
                          : 5 * 1.2 * fontScale,
                    },
                  ],
                }}
              />{' '}
            </>
          )}
          <Text
            style={{
              fontSize: 32,
              color: theme.colors.secondary,
            }}
          >
            {card.data.source}
          </Text>
        </Text>
      </View>
      {(card.data.ipa ||
        card.data.partOfSpeech ||
        card.data.g ||
        (showInflections && presentAndPast)) && (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginLeft: 8,
            marginTop: 6,
            gap: 8,
          }}
        >
          {card.data.ipa && <Text>/{sanitizeTranscript(card.data.ipa)}/</Text>}
          {card.data.g && <Text>({card.data.g})</Text>}
          {card.data.partOfSpeech && <Text>{card.data.partOfSpeech}</Text>}
          {showInflections && presentAndPast && <Text>{presentAndPast}</Text>}
          {showInflections &&
            card.data.number === 'singular' &&
            isGoodPlural(card.data.pluralForm) && (
              <Text>
                {t('study.cardFront.plural', {
                  value: card.data.pluralForm,
                })}
              </Text>
            )}
        </View>
      )}
      {card.data.example && (
        <View style={{ marginTop: 12, marginLeft: 8 }}>
          <CardExample
            ref={cardExampleRef}
            example={card.data.example}
            textStyle={{ fontSize: 18 }}
            language={card.data.language}
            onPress={onPress}
          />
        </View>
      )}
    </View>
  );
};
