import { CardItem, DeckSettings, isGoogleTTSLanguage } from '@vocably/model';
import { isGoodPlural, sanitizeTranscript } from '@vocably/sulna';
import React, { FC, useEffect, useRef, useState } from 'react';
import { PixelRatio, Platform, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native-paper';
import { CardExample, CardExampleRef } from '../../CardExample';
import { isolate } from '../../isolate';
import { PlaySound, PlaySoundRef } from '../../PlaySound';
import { studySmallFontSize } from '../../styles';
import { Tag } from '../../Tag';
import { useAppTheme } from '../../ThemeProvider';

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
  const theme = useAppTheme();
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

  const tags = [
    card.data.partOfSpeech &&
      t(`language.${card.data.partOfSpeech}`, card.data.partOfSpeech),
    card.data.g && isolate(card.data.g),
  ].filter(Boolean) as string[];

  const inflections = showInflections
    ? ([
        card.data.presentTenses &&
          t('common.presentTenses', { value: card.data.presentTenses }),
        card.data.tense === 'present' &&
          card.data.pastTenses &&
          t('common.pastTenses', { value: isolate(card.data.pastTenses) }),
        card.data.number === 'singular' &&
          isGoodPlural(card.data.pluralForm) &&
          t('common.plural', { value: isolate(card.data.pluralForm) }),
      ].filter(Boolean) as string[])
    : [];

  const mutedColor = theme.colors.onSurfaceVariant;

  return (
    <View>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'baseline',
          flexWrap: 'wrap',
          width: '100%',
          direction: 'ltr',
        }}
      >
        <Text
          style={{
            fontSize: 18,
            textAlignVertical: 'top',
            // The transparent border is a quick fix for
            // Android to vertically align then PlaySound icon
            borderWidth: 1,
            borderColor: 'transparent',
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
                          : 3 * 1.2 * fontScale,
                    },
                  ],
                }}
              />{' '}
            </>
          )}
          <Text
            style={{
              fontSize: 34,
              fontWeight: '600',
              letterSpacing: -0.3,
              color: theme.colors.secondary,
            }}
          >
            {isolate(card.data.source)}
          </Text>
        </Text>
      </View>
      {(card.data.ipa || tags.length > 0) && (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            marginTop: 10,
            gap: 8,
          }}
        >
          {card.data.ipa && (
            <Text style={{ fontSize: 16, color: mutedColor }}>
              /{isolate(sanitizeTranscript(card.data.ipa))}/
            </Text>
          )}
          {tags.map((tag, index) => (
            <Tag key={index}>{tag}</Tag>
          ))}
        </View>
      )}
      {inflections.length > 0 && (
        <View style={{ marginTop: 10, gap: 2 }}>
          {inflections.map((inflection, index) => (
            <Text key={index} style={{ fontSize: 15, color: mutedColor }}>
              {inflection}
            </Text>
          ))}
        </View>
      )}
      {card.data.example && (
        <View style={{ marginTop: 20 }}>
          <CardExample
            ref={cardExampleRef}
            example={card.data.example}
            textStyle={{ fontSize: studySmallFontSize }}
            language={card.data.language}
            onPress={onPress}
            hideBul={true}
          />
        </View>
      )}
    </View>
  );
};
