import { CardItem, isGoogleTTSLanguage } from '@vocably/model';
import { isGoodPlural, sanitizeTranscript } from '@vocably/sulna';
import React, { FC, useEffect, useRef, useState } from 'react';
import { PixelRatio, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { CardExample } from '../../CardExample';
import { PlaySound } from '../../PlaySound';

type Props = {
  card: CardItem;
  autoPlay: boolean;
  showInflections?: boolean;
};

export const CardFront: FC<Props> = ({
  card,
  autoPlay,
  showInflections = false,
}) => {
  const theme = useTheme();

  const [isAutoPlayed, setIsAutoPlayed] = useState(false);
  const playRef = useRef();

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

    // @ts-ignore
    playRef.current.play();
    setIsAutoPlayed(true);
  }, [isAutoPlayed, autoPlay]);

  const fontScale = PixelRatio.getFontScale();

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
                // @ts-ignore
                ref={playRef}
                style={{
                  transform: [
                    {
                      translateY: 4 * fontScale,
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
        (showInflections &&
          card.data.tense === 'present' &&
          card.data.pastTenses)) && (
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
          {showInflections &&
            card.data.tense === 'present' &&
            card.data.pastTenses && <Text>(past: {card.data.pastTenses})</Text>}
          {showInflections &&
            card.data.number === 'singular' &&
            isGoodPlural(card.data.pluralForm) && (
              <Text>(plural: {card.data.pluralForm})</Text>
            )}
        </View>
      )}
      {card.data.example && (
        <View style={{ marginTop: 12, marginLeft: 8 }}>
          <CardExample
            example={card.data.example}
            textStyle={{ fontSize: 18 }}
          />
        </View>
      )}
    </View>
  );
};
