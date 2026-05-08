import { CardItem, DeckSettings, isGoogleTTSLanguage } from '@vocably/model';
import { SrsScore } from '@vocably/srs';
import { shuffle } from 'lodash-es';
import { FC, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  PixelRatio,
  ScrollView,
  StyleProp,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import {
  Button,
  Surface,
  Text,
  TouchableRipple,
  useTheme,
} from 'react-native-paper';
import { ReverseCardFront, ReverseCardFrontRef } from './Card/ReverseCardFront';
import { Displayer, DisplayerRef } from './Displayer';
import { PlaySound, PlaySoundRef } from '../PlaySound';

type Props = {
  card: CardItem;
  onGrade: (score: SrsScore) => void;
  autoPlay?: boolean;
  playRandomExample?: boolean;
  deckSettings: DeckSettings;
};

export const ArrangeByLetters: FC<Props> = ({
  card,
  onGrade,
  autoPlay = false,
  playRandomExample = true,
  deckSettings,
}) => {
  const displayerRef = useRef<DisplayerRef>(null);
  const theme = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const x = useRef(new Animated.Value(0)).current;
  const [hintedOrMistaken, setHintedOrMistaken] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const correctString = card.data.source.toUpperCase();
  const lettersRef = useRef<string[]>(shuffle(correctString.split('')));
  const [answer, setAnswer] = useState<Array<number | false>>(
    lettersRef.current.map(() => false)
  );
  const [isAnswerVisible, setIsAnswerVisible] = useState(false);

  const fontScale = Math.max(1, PixelRatio.getFontScale());

  const playSoundRef = useRef<PlaySoundRef>(null);
  const reverseCardFrontRef = useRef<ReverseCardFrontRef>(null);

  useEffect(() => {
    if (!autoPlay) {
      return;
    }

    if (!isAnswerVisible) {
      return;
    }

    const timeOutId = setTimeout(async () => {
      await playSoundRef.current?.play();
      if (playRandomExample) {
        await reverseCardFrontRef.current?.playExample();
      }
    }, 500);

    return () => {
      clearTimeout(timeOutId);
    };
  }, [autoPlay, isAnswerVisible]);

  useEffect(() => {
    const timeOutId = setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({
          animated: true,
        });
      }
    }, 1000);

    return () => {
      clearTimeout(timeOutId);
    };
  }, []);

  const shake = () => {
    const intensity = 14;
    const totalDuration = 420;

    x.stopAnimation(); // cancel any in-flight animation

    // Damped offsets (in "units", multiplied by intensity below)
    // Starts strong, decays naturally.
    const offsets = [-1, 1, -0.8, 0.8, -0.6, 0.6, -0.3, 0.3, 0];

    // Slightly front-load the time to the first jolts, then taper
    const base = totalDuration / offsets.length;

    const seq = offsets.map((o, i) =>
      Animated.timing(x, {
        toValue: o * intensity,
        duration: Math.max(40, base * (1.15 - i * 0.08)), // ease-out feel
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      })
    );

    // Finish with a small spring to settle perfectly on 0
    Animated.sequence([
      ...seq,
      Animated.spring(x, {
        toValue: 0,
        // Using friction/tension for broad RN support
        friction: 6,
        tension: 180,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const validateResponse = (answer: number[]) => {
    const answerString = answer
      .map((answerIndex) => lettersRef.current[answerIndex])
      .join('');

    if (answerString === correctString) {
      setIsCorrect(true);
      if (displayerRef.current) {
        displayerRef.current
          .hide()
          .then(() => onGrade(hintedOrMistaken ? 3 : 5));
      }
      return;
    } else {
      setHintedOrMistaken(true);
      shake();
    }
  };

  const setAnswerIndex = (answerLetterIndex: number) => {
    const firstFalseIndex = answer.findIndex(
      (indexOrFalse) => indexOrFalse === false
    );

    if (firstFalseIndex === undefined) {
      return;
    }

    const newValue = [
      ...answer.slice(0, firstFalseIndex),
      answerLetterIndex,
      ...answer.slice(firstFalseIndex + 1),
    ];

    setAnswer(newValue);

    if (newValue.every((v) => v !== false)) {
      // @ts-ignore
      validateResponse(newValue);
    }
  };

  const removeAnswerIndex = (answerLetterIndex: number) => {
    setAnswer(answer.map((i) => (i === answerLetterIndex ? false : i)));
  };

  const letterContainerStyle: StyleProp<ViewStyle> = {
    borderWidth: 1,
    borderRadius: 12,
    width: 32 * fontScale,
    height: 32 * fontScale,
    alignItems: 'center',
    justifyContent: 'center',
  };

  const letterStyle: StyleProp<TextStyle> = {
    fontSize: 16,
    lineHeight: 30,
    fontWeight: 'bold',
    width: 32 * fontScale,
    textAlign: 'center',
    color: theme.colors.secondary,
  };

  const response: Array<number | false> = lettersRef.current.map((_, index) => {
    if (!answer.includes(index)) {
      return index;
    } else {
      return false;
    }
  });

  return (
    <ScrollView
      ref={scrollViewRef}
      style={{
        width: '100%',
      }}
      contentContainerStyle={{
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Displayer
        ref={displayerRef}
        style={{
          padding: 16,
          maxWidth: 700,
          gap: 16,
        }}
      >
        <ReverseCardFront
          deckSettings={deckSettings}
          ref={reverseCardFrontRef}
          hasChecked={isAnswerVisible}
          card={card}
          requiredAction="Type in"
        />
        <Animated.View
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: 6,
              width: 322,
              padding: 12,
              alignSelf: 'center',
            },
            { transform: [{ translateX: x }] },
          ]}
        >
          {answer.map((indexOrFalse, itemIndex) => (
            <TouchableRipple
              key={itemIndex}
              disabled={indexOrFalse === false}
              borderless={true}
              style={[
                letterContainerStyle,
                {
                  borderColor: isCorrect
                    ? theme.colors.primary
                    : theme.colors.onSurface,
                  backgroundColor: isCorrect ? theme.colors.primary : undefined,
                },
              ]}
              onPress={() => {
                if (indexOrFalse !== false) {
                  removeAnswerIndex(indexOrFalse);
                }
              }}
            >
              <Text
                style={[
                  letterStyle,
                  {
                    opacity: indexOrFalse !== false ? 1 : 0,
                    color: isCorrect
                      ? theme.colors.onPrimary
                      : theme.colors.secondary,
                  },
                ]}
              >
                {indexOrFalse === false
                  ? '_'
                  : lettersRef.current[indexOrFalse].replace(' ', '_')}
              </Text>
            </TouchableRipple>
          ))}
        </Animated.View>
        <Surface
          elevation={2}
          mode="flat"
          style={{
            alignSelf: 'center',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: 6,
            width: 322,
            padding: 12,
            borderRadius: 24,
          }}
        >
          {response.map((indexOrFalse, itemIndex) => (
            <TouchableRipple
              key={itemIndex}
              disabled={indexOrFalse === false}
              borderless={true}
              style={[
                letterContainerStyle,
                {
                  borderColor: theme.colors.onSurface,
                  opacity: indexOrFalse !== false ? 1 : 0,
                  backgroundColor: theme.colors.elevation.level4,
                },
              ]}
              onPress={() => {
                if (indexOrFalse !== false) {
                  setAnswerIndex(indexOrFalse);
                }
              }}
            >
              <Text style={letterStyle}>
                {indexOrFalse === false
                  ? '_'
                  : lettersRef.current[indexOrFalse].replace(' ', '_')}
              </Text>
            </TouchableRipple>
          ))}
        </Surface>
        <View
          style={{
            alignSelf: 'center',
            minHeight: 40,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {!isAnswerVisible && (
            <Button
              onPress={() => {
                setIsAnswerVisible(true);
                setHintedOrMistaken(true);
              }}
            >
              Show me the answer
            </Button>
          )}
          {isAnswerVisible && (
            <Text>
              {isGoogleTTSLanguage(card.data.language) && (
                <>
                  <PlaySound
                    ref={playSoundRef}
                    text={card.data.source}
                    language={card.data.language}
                    size={24}
                    style={{
                      transform: [
                        {
                          translateY: 7 * fontScale,
                        },
                      ],
                    }}
                  />{' '}
                </>
              )}
              <Text>{correctString}</Text>
            </Text>
          )}
        </View>
      </Displayer>
    </ScrollView>
  );
};
