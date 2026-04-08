import { NavigationProp, Route } from '@react-navigation/native';
import { CardItem, GoogleLanguage, SrsItem } from '@vocably/model';
import { craftTheStrategy, grade, slice, SrsScore } from '@vocably/srs';
import { setBadgeCount } from 'aws-amplify/push-notifications';
import { cloneDeep, omit, shuffle } from 'lodash-es';
import { usePostHog } from 'posthog-react-native';
import React, {
  FC,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import { Alert, View } from 'react-native';
import { IconButton, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getAutoPlayFromStorage,
  saveAutoPlayToStorage,
} from '../autoPlayState';
import { useSelectedDeck } from '../languageDeck/useSelectedDeck';
import { Loader } from '../loaders/Loader';
import { useNumberOfStudySessions } from '../RequestFeedback/useNumberOfStudySessions';
import {
  getMaximumCardsPerSession,
  getPlayRandomExample,
  getRandomizerEnabled,
} from '../Settings/StudySettingsScreen';
import { ScreenLayout } from '../ui/ScreenLayout';
import { useAsync } from '../useAsync';
import { UserMetadataContext } from '../UserMetadataContainer';
import { useStudySteps } from '../useStudySteps';
import { Completed } from './Completed';
import { getPredefinedMultiChoiceOptions } from './getPredefinedMultiChoiceOptions';
import { Grade } from './Grade';
import { useCardsAnsweredToday } from './useCardsAnsweredToday';
import { useStreakHasBeenShown } from './useStreakHasBeenShown';
import { useTranslationLanguage } from './useTranslationLanguage';

const srsFieldsObject: Record<keyof SrsItem, true> = {
  state: true,
  dueDate: true,
  eFactor: true,
  interval: true,
  lastStudied: true,
  repetition: true,
};

const srsFields = Object.keys(srsFieldsObject) as (keyof SrsItem)[];

export const PADDING_VERTICAL = 40;

type Props = FC<{
  route: Route<string, any>;
  navigation: NavigationProp<any>;
}>;

export const StudyScreen: Props = ({ route, navigation }) => {
  const theme = useTheme();

  const [autoPlayResult, setAutoPlay] = useAsync(
    getAutoPlayFromStorage,
    saveAutoPlayToStorage
  );

  const [playRandomExampleResult] = useAsync(getPlayRandomExample);

  const studySteps = useStudySteps();

  const {
    status: loadDeckStatus,
    update,
    filteredCards,
    deck: { language, cards: allCards },
  } = useSelectedDeck({
    autoReload: false,
  });

  const [isRandomizerEnabledResult] = useAsync(getRandomizerEnabled);
  const [maximumCardsPerSessionResult] = useAsync(getMaximumCardsPerSession);

  const [cards, setCards] = useState<CardItem[]>();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  // Set cards studied to -1 as the initial state
  // this will be changed to 0 when filtered cards are loaded
  const [cardsStudied, setCardsStudied] = useState(-1);
  const [numberOfStudySessions, increaseNumberOfStudySessions] =
    useNumberOfStudySessions();
  const [cardsAnsweredToday, increaseCardsAnsweredToday] =
    useCardsAnsweredToday();

  const translationLanguage = useTranslationLanguage(
    language as GoogleLanguage
  );

  const [streakHasShownToday, setStreakHasShown] = useStreakHasBeenShown();
  const { studyStreak, increaseStudyStreak } = useContext(UserMetadataContext);

  useEffect(() => {
    if (
      cardsAnsweredToday !== null &&
      cardsAnsweredToday.answers > 0 &&
      maximumCardsPerSessionResult.status === 'loaded' &&
      cardsAnsweredToday.answers % maximumCardsPerSessionResult.value === 0
    ) {
      setBadgeCount(0);
    }
  }, [cardsAnsweredToday, maximumCardsPerSessionResult]);

  const { planSection } = route.params ?? ({} as { planSection?: string });

  useEffect(() => {
    if (
      cardsStudied === -1 &&
      isRandomizerEnabledResult.status === 'loaded' &&
      maximumCardsPerSessionResult.status === 'loaded'
    ) {
      let sessionCards: CardItem[];
      if (isRandomizerEnabledResult.value) {
        sessionCards = shuffle(filteredCards).slice(
          0,
          maximumCardsPerSessionResult.value
        );
      } else {
        sessionCards = slice(
          new Date(),
          maximumCardsPerSessionResult.value,
          filteredCards,
          planSection
        );
      }

      setCards(cloneDeep(sessionCards));
      setCardsStudied(0);
      setCurrentCardIndex(0);
    }
  }, [
    filteredCards,
    cardsStudied,
    isRandomizerEnabledResult,
    maximumCardsPerSessionResult,
  ]);

  useEffect(() => {
    setCards((cards) => {
      if (cards === undefined) {
        return undefined;
      }

      const filteredCardsMap = Object.fromEntries(
        filteredCards.map((filteredCard) => [filteredCard.id, filteredCard])
      );

      return cards
        .filter((card) => filteredCardsMap[card.id])
        .map((card) => {
          return {
            ...card,
            data: {
              ...card.data,
              ...omit(filteredCardsMap[card.id].data, srsFields),
            },
          };
        });
    });
  }, [filteredCards]);

  useEffect(() => {
    if (!cards) {
      return;
    }

    if (cards.length < cardsStudied) {
      setCardsStudied(cards.length);
    }
  }, [cards, cardsStudied, setCardsStudied]);

  const onGrade = (score: SrsScore) => {
    if (cards === undefined) {
      return;
    }

    if (cards.length === 0) {
      return;
    }

    const { strategy } = craftTheStrategy({
      studySteps: studySteps,
      card: cards[currentCardIndex],
      allCards,
      prerenderedCards: translationLanguage
        ? getPredefinedMultiChoiceOptions(
            language as GoogleLanguage,
            translationLanguage
          )
        : [],
    });

    update(
      cards[currentCardIndex].id,
      grade(cards[currentCardIndex].data, score, strategy)
    ).then(async (result) => {
      if (result.success === false) {
        Alert.alert(
          `Error: Card update failed`,
          result.errorCode === 'NETWORK_REQUEST_ERROR'
            ? `Your answer wasn't saved due to a lost connection. The session will stop and resume from the failed answer.`
            : `Oops! Unable to continue study session due to a technical issue. Please try again later.`,
          [
            {
              text: 'Exit study session',
              onPress: () => navigation.goBack(),
            },
          ]
        );

        return;
      }

      if (cardsStudied > 0) {
        return;
      }

      await increaseStudyStreak();
    });

    increaseCardsAnsweredToday();
    const followingIndex = currentCardIndex + 1;
    setCurrentCardIndex(followingIndex);

    if (currentCardIndex === cardsStudied) {
      setCardsStudied(followingIndex);
    }

    if (followingIndex === cards.length) {
      setBadgeCount(0);
      increaseNumberOfStudySessions();
    }
  };

  const posthog = usePostHog();

  useEffect(() => {
    if (
      isRandomizerEnabledResult.status !== 'loaded' ||
      maximumCardsPerSessionResult.status !== 'loaded'
    ) {
      return;
    }

    posthog.capture('study_started', {
      isRandomizerEnabled: isRandomizerEnabledResult.value,
      maximumCardsPerSession: maximumCardsPerSessionResult.value,
      language,
    });
  }, [posthog, isRandomizerEnabledResult, maximumCardsPerSessionResult]);

  const insets = useSafeAreaInsets();

  useLayoutEffect(() => {
    if (
      loadDeckStatus === 'loading' ||
      cards === undefined ||
      isRandomizerEnabledResult.status !== 'loaded' ||
      autoPlayResult.status !== 'loaded' ||
      maximumCardsPerSessionResult.status !== 'loaded' ||
      streakHasShownToday.status !== 'loaded' ||
      playRandomExampleResult.status !== 'loaded'
    ) {
      return;
    }

    const originalCard = filteredCards.find(
      (f) => f.id === cards[currentCardIndex]?.id
    );

    navigation.setOptions({
      headerTitle: '',
      headerRight: () => (
        <>
          {cards.length > 0 && originalCard && (
            <>
              <IconButton
                icon={'creation'}
                size={24}
                onPress={() =>
                  navigation.navigate('ChatWithCardModal', {
                    card: originalCard.data,
                  })
                }
                style={{
                  backgroundColor: theme.colors.background,
                }}
              />
              <IconButton
                icon={'pencil'}
                size={24}
                onPress={() =>
                  navigation.navigate('EditCardModal', {
                    card: originalCard,
                  })
                }
                style={{
                  backgroundColor: theme.colors.background,
                }}
              />
            </>
          )}
          <IconButton
            icon={autoPlayResult.value ? 'volume-high' : 'volume-variant-off'}
            size={24}
            animated={true}
            onPress={() => setAutoPlay(!autoPlayResult.value)}
            style={{
              transform: [{ translateX: -9 }],
              backgroundColor: theme.colors.background,
            }}
          />
        </>
      ),
      headerLeft: () => (
        <IconButton
          icon={'close'}
          size={24}
          onPress={() => navigation.goBack()}
          style={{
            backgroundColor: 'transparent',
          }}
        />
      ),
    });
  }, [
    cards,
    autoPlayResult,
    loadDeckStatus,
    isRandomizerEnabledResult,
    maximumCardsPerSessionResult,
    streakHasShownToday,
    filteredCards,
  ]);

  if (
    loadDeckStatus === 'loading' ||
    cards === undefined ||
    isRandomizerEnabledResult.status !== 'loaded' ||
    autoPlayResult.status !== 'loaded' ||
    maximumCardsPerSessionResult.status !== 'loaded' ||
    streakHasShownToday.status !== 'loaded' ||
    playRandomExampleResult.status !== 'loaded'
  ) {
    return <Loader>Loading...</Loader>;
  }

  const previousIsPossible = currentCardIndex > 0;
  const nextIsPossible = currentCardIndex < cardsStudied;

  return (
    <ScreenLayout
      content={
        <View
          style={{
            flexGrow: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {cards.length > currentCardIndex && (
            <Grade
              key={cards[currentCardIndex].id}
              card={cards[currentCardIndex]}
              onGrade={onGrade}
              autoPlay={autoPlayResult.value}
              playRandomExample={playRandomExampleResult.value}
              existingCards={allCards}
              studySteps={studySteps}
              prerenderedCards={
                translationLanguage
                  ? getPredefinedMultiChoiceOptions(
                      language as GoogleLanguage,
                      translationLanguage
                    )
                  : []
              }
            />
          )}
          {cards.length === currentCardIndex && (
            <Completed
              cards={allCards}
              onDone={() => navigation.goBack()}
              numberOfStudySessions={
                numberOfStudySessions.status === 'loaded'
                  ? numberOfStudySessions.value
                  : 0
              }
              onStudyAgain={() => setCardsStudied(-1)}
              streakHasBeenShown={streakHasShownToday.value}
              streakDays={studyStreak.days}
              onShow={() => setStreakHasShown()}
              canStudyAgain={!planSection}
            ></Completed>
          )}
        </View>
      }
      footer={
        <>
          <View
            style={{
              paddingBottom: insets.bottom + 16,
              paddingHorizontal: 16,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                padding: 8,
                backgroundColor: theme.colors.background,
                borderRadius: 16,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <IconButton
                icon={'menu-left'}
                disabled={!previousIsPossible}
                style={{
                  opacity: previousIsPossible ? 1 : 0.3,
                }}
                onPress={() => {
                  if (!previousIsPossible) {
                    return;
                  }
                  setCurrentCardIndex(currentCardIndex - 1);
                }}
              />
              <Text>
                <Text style={{ color: theme.colors.secondary }}>
                  {Math.min(currentCardIndex + 1, cards.length)}
                </Text>
                {' / '}
                {cards.length}
              </Text>
              <IconButton
                icon={'menu-right'}
                disabled={!nextIsPossible}
                style={{
                  opacity: nextIsPossible ? 1 : 0.3,
                }}
                onPress={() => {
                  if (!nextIsPossible) {
                    return;
                  }
                  setCurrentCardIndex(currentCardIndex + 1);
                }}
              />
            </View>
          </View>
        </>
      }
    />
  );
};
