import AsyncStorage from '@react-native-async-storage/async-storage';
import { CardItem, DeckSettings } from '@vocably/model';
import React, { FC, useCallback, useRef, useState } from 'react';
import { Animated, TouchableWithoutFeedback, View } from 'react-native';
import { useAsync } from '../useAsync';
import { CardBack } from './Card/CardBack';
import { CardFront } from './Card/CardFront';
import { ReverseCardBack } from './Card/ReverseCardBack';
import { ReverseCardFront } from './Card/ReverseCardFront';
import { TapDot } from './Card/TapDot';
import { Displayer } from './Displayer';

const loadTapHelperIsNeeded = () =>
  AsyncStorage.getItem('swiperTapHelperIsNeeded').then(
    (value) => value !== 'false'
  );

const setTapHelperIsNeeded = async (isNeeded: boolean) => {
  AsyncStorage.setItem('swiperTapHelperIsNeeded', isNeeded ? 'true' : 'false');
};

type Props = {
  autoPlay: boolean;
  playRandomExample: boolean;
  card: CardItem;
  direction: 'front' | 'back';
  deckSettings: DeckSettings;
};

export const Card: FC<Props> = ({
  card,
  autoPlay,
  playRandomExample,
  direction,
  deckSettings,
}) => {
  const [containerHeight, setContainerHeight] = useState(300);
  const [cardSideHeight, setCardSideHeight] = useState(0);

  const cardIsBiggerThanContainer = cardSideHeight > containerHeight;

  const flipAnimation = useRef(new Animated.Value(0)).current;
  const flipToFrontStyle = {
    transform: [
      {
        rotateY: flipAnimation.interpolate({
          inputRange: [0, 180],
          outputRange: ['180deg', '360deg'],
        }),
      },
    ],
  };
  const flipToBackStyle = {
    transform: [
      {
        rotateY: flipAnimation.interpolate({
          inputRange: [0, 180],
          outputRange: ['0deg', '180deg'],
        }),
      },
    ],
  };

  const [isFlipped, setIsFlipped] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  const [tapHelperIsNeededResult, mutateTapHelperIsNeeded] = useAsync(
    loadTapHelperIsNeeded,
    setTapHelperIsNeeded
  );

  const flipToBack = useCallback(() => {
    setIsFlipped(true);
    Animated.timing(flipAnimation, {
      toValue: 180,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [Animated, flipAnimation, setIsFlipped]);

  const flipToFront = useCallback(() => {
    setIsFlipped(false);
    setHasChecked(true);
    Animated.timing(flipAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [Animated, flipAnimation, setIsFlipped, setHasChecked]);

  const isReverse = direction === 'back';

  const onPress = () => {
    isFlipped ? flipToFront() : flipToBack();
    mutateTapHelperIsNeeded(false);
  };

  return (
    <Displayer style={{ flex: 1 }}>
      {tapHelperIsNeededResult.status === 'loaded' &&
        tapHelperIsNeededResult.value && (
          <TapDot
            style={{
              right: '10%',
              bottom: '20%',
            }}
          />
        )}
      <TouchableWithoutFeedback onPress={onPress}>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: cardIsBiggerThanContainer ? 'flex-start' : 'center',
            width: '100%',
            padding: 20,
          }}
          onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}
        >
          <Animated.View
            style={{
              backfaceVisibility: 'hidden',
              ...flipToFrontStyle,
              display: 'flex',
              maxWidth: '100%',
            }}
            pointerEvents={!isFlipped ? 'none' : 'auto'}
            onLayout={(e) =>
              setCardSideHeight(
                Math.max(cardSideHeight, e.nativeEvent.layout.height)
              )
            }
          >
            {isReverse ? (
              <ReverseCardBack
                deckSettings={deckSettings}
                autoPlay={autoPlay && isFlipped}
                playRandomExample={playRandomExample}
                card={card}
                onPress={onPress}
              />
            ) : (
              <CardBack
                deckSettings={deckSettings}
                card={card}
                onPress={onPress}
              />
            )}
          </Animated.View>
          <Animated.View
            style={{
              position: 'absolute',
              backfaceVisibility: 'hidden',
              width: '100%',
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              ...flipToBackStyle,
            }}
            pointerEvents={isFlipped ? 'none' : 'auto'}
            onLayout={(e) =>
              setCardSideHeight(
                Math.max(cardSideHeight, e.nativeEvent.layout.height)
              )
            }
          >
            {isReverse ? (
              <ReverseCardFront
                card={card}
                hasChecked={hasChecked}
                onPress={onPress}
                deckSettings={deckSettings}
              />
            ) : (
              <CardFront
                deckSettings={deckSettings}
                autoPlay={autoPlay && !isFlipped}
                playRandomExample={playRandomExample}
                card={card}
                onPress={onPress}
              />
            )}
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Displayer>
  );
};
