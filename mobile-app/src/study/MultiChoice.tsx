import {
  CardItem,
  DeckSettings,
  GoogleLanguage,
  isGoogleTTSLanguage,
} from '@vocably/model';
import { SrsScore } from '@vocably/srs';
import { sanitizeTranscript } from '@vocably/sulna';
import { shuffle } from 'lodash-es';
import React, { FC, useMemo, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Button, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { CardDefinition } from '../CardDefinition';
import { PlaySound, PlaySoundRef } from '../PlaySound';
import { CardFront } from './Card/CardFront';
import { Displayer, DisplayerRef } from './Displayer';
import { PADDING_VERTICAL } from './StudyScreen';

type Props = {
  autoPlay: boolean;
  playRandomExample: boolean;
  card: CardItem;
  onGrade: (score: SrsScore) => void;
  alternatives: CardItem[];
  direction: 'front' | 'back';
  deckSettings: DeckSettings;
};

const buttonBorderRadius = 16;

const transcriptionLanguages: GoogleLanguage[] = [
  'zh',
  'zh-TW',
  'ja',
  'hi',
  'hy',
  'hyw',
  'ga',
  'ka',
];

export const MultiChoice: FC<Props> = ({
  card,
  onGrade,
  alternatives,
  autoPlay,
  playRandomExample,
  direction,
  deckSettings,
}) => {
  const theme = useTheme();

  const [wrong, setWrong] = useState<string[]>([]);
  const [correct, setCorrect] = useState<string>('');
  const [playSoundIconVisible, setPlaySoundIconVisible] = useState(false);
  const displayerRef = useRef<DisplayerRef>(null);
  const playSoundRef = useRef<PlaySoundRef | null>(null);
  const [correctVisible, setCorrectVisible] = useState(false);

  const answers = useMemo(() => shuffle([...alternatives, card]), []);

  const closeAndGrade = async (score: SrsScore) => {
    if (autoPlay && playSoundRef.current) {
      setPlaySoundIconVisible(true);
      await playSoundRef.current.play().catch(() => null);
    }

    if (displayerRef.current) {
      displayerRef.current.hide().then(() => {
        onGrade(score);
      });
    } else {
      onGrade(score);
    }
  };

  const validate = (validateItem: CardItem) => {
    if (wrong.includes(card.id)) {
      return;
    }

    if (validateItem.id !== card.id) {
      setWrong([...wrong, validateItem.id]);
      return;
    }

    setCorrect(card.id);
    closeAndGrade(wrong.length === 0 && !correctVisible ? 5 : 3);
  };

  const showAnswer = () => {
    if (correctVisible) {
      return;
    }

    setCorrectVisible(true);
    setPlaySoundIconVisible(true);
  };

  const [minHeight, setMinHeight] = useState(36);

  return (
    <>
      <ScrollView
        style={{
          width: '100%',
        }}
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingBottom: PADDING_VERTICAL,
        }}
      >
        <Displayer
          ref={displayerRef}
          style={{
            padding: 16,
            maxWidth: 700,
          }}
        >
          {direction === 'back' && (
            <>
              <Text style={{ fontSize: 24, marginBottom: 12 }}>
                Select the correct answer for the{' '}
                {card.data.partOfSpeech ? (
                  <Text style={{ color: theme.colors.secondary }}>
                    {card.data.partOfSpeech}
                  </Text>
                ) : (
                  'meaning'
                )}
                {':'}
              </Text>
              <View style={{ alignSelf: 'flex-start' }}>
                <CardDefinition
                  card={card.data}
                  textStyle={{ fontSize: 24 }}
                  maskSource={true}
                  hideDefinitions={deckSettings.hideDefinitions}
                />
              </View>
            </>
          )}
          {direction === 'front' && (
            <>
              <CardFront
                card={card}
                autoPlay={autoPlay}
                playRandomExample={playRandomExample}
                showInflections={true}
                deckSettings={deckSettings}
              />
            </>
          )}
          <View
            style={{
              marginTop: 32,
              width: '100%',
              gap: 4,
            }}
          >
            {answers.map((answerCard, index) => (
              <View
                key={answerCard.id}
                style={{
                  padding: 2,
                  backgroundColor:
                    correctVisible && card.id === answerCard.id
                      ? theme.colors.primary
                      : undefined,
                  borderRadius: buttonBorderRadius + 2,
                  overflow: 'hidden',
                }}
              >
                <TouchableRipple
                  borderless={true}
                  disabled={wrong.includes(answerCard.id)}
                  onPress={() => validate(answerCard)}
                  onLayout={(event) => {
                    const { height } = event.nativeEvent.layout;
                    if (height > minHeight) {
                      setMinHeight(height);
                    }
                  }}
                  style={{
                    flexDirection: 'column',
                    paddingVertical: 12,
                    paddingHorizontal: 8,
                    borderRadius: buttonBorderRadius,
                    minHeight: minHeight,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: wrong.includes(answerCard.id)
                      ? theme.colors.error
                      : theme.colors.primary,
                    backgroundColor: wrong.includes(answerCard.id)
                      ? theme.colors.error
                      : correct === answerCard.id
                        ? theme.colors.primary
                        : theme.colors.background,
                  }}
                >
                  <View
                    style={{
                      alignSelf: 'stretch',
                      position: 'relative',
                    }}
                  >
                    <Text
                      style={{
                        width: '100%',
                        textAlign: 'center',
                        fontSize: 18,
                        color: wrong.includes(answerCard.id)
                          ? theme.colors.onError
                          : correct === answerCard.id
                            ? theme.colors.onPrimary
                            : theme.colors.primary,
                      }}
                    >
                      {direction === 'back'
                        ? answerCard.data.source
                        : answerCard.data.translation ||
                          answerCard.data.definition}

                      {direction === 'back' &&
                        answerCard.data.ipa &&
                        transcriptionLanguages.includes(
                          answerCard.data.language as GoogleLanguage
                        ) && (
                          <Text
                            style={{
                              fontSize: 14,
                              verticalAlign: 'middle',
                              color: wrong.includes(answerCard.id)
                                ? theme.colors.onError
                                : correct === answerCard.id
                                  ? theme.colors.onPrimary
                                  : theme.colors.primary,
                            }}
                          >
                            {' '}
                            /{sanitizeTranscript(answerCard.data.ipa)}/
                          </Text>
                        )}
                    </Text>
                    {card.id === answerCard.id &&
                      direction === 'back' &&
                      isGoogleTTSLanguage(answerCard.data.language) && (
                        <PlaySound
                          size={24} // size is needed for the translateY
                          ref={(el) => (playSoundRef.current = el)}
                          style={{
                            position: 'absolute',
                            left: 0,
                            top: '50%',
                            display: playSoundIconVisible ? 'flex' : 'none',
                            transform: [
                              { translateY: -12 }, // half of the size
                            ],
                          }}
                          color={
                            correct === answerCard.id
                              ? theme.colors.onPrimary
                              : theme.colors.onBackground
                          }
                          text={answerCard.data.source}
                          language={answerCard.data.language}
                        />
                      )}
                  </View>
                </TouchableRipple>
              </View>
            ))}
            <Button
              style={{ marginTop: 16, alignSelf: 'center' }}
              onPress={showAnswer}
              textColor={theme.colors.onBackground}
            >
              Show the correct answer
            </Button>
          </View>
        </Displayer>
      </ScrollView>
      <LinearGradient
        locations={[0.1, 1]}
        // @ts-ignore
        colors={[theme.colors.transparentSurface, theme.colors.surface]}
        style={{
          position: 'absolute',
          display: 'flex',
          bottom: 0,
          width: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          height: PADDING_VERTICAL,
          pointerEvents: 'none',
        }}
      ></LinearGradient>
    </>
  );
};
