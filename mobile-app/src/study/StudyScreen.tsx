import { NavigationProp, Route } from '@react-navigation/native';
import { CardItem, GoogleLanguage } from '@vocably/model';
import { grade, slice, SrsScore } from '@vocably/srs';
import { setBadgeCount } from 'aws-amplify/push-notifications';
import { shuffle } from 'lodash-es';
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
  getRandomizerEnabled,
} from '../Settings/StudySettingsScreen';
import { ScreenLayout } from '../ui/ScreenLayout';
import { useAsync } from '../useAsync';
import { UserMetadataContext } from '../UserMetadataContainer';
import { useStudySteps } from '../useStudySteps';
import { useCardsAnsweredToday } from './cardsAnsweredToday';
import { Completed } from './Completed';
import { craftTheStrategy } from './craftTheStrategy';
import { getPredefinedMultiChoiceOptions } from './getPredefinedMultiChoiceOptions';
import { Grade } from './Grade';
import { useStreakHasBeenShown } from './useStreakHasBeenShown';
import { useTranslationLanguage } from './useTranslationLanguage';

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
  const [cardsInTheCurrentSession, setCardsInTheCurrentSession] = useState(0);
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

      setCardsInTheCurrentSession(sessionCards.length);
      setCards(sessionCards);
      setCardsStudied(0);
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
        .map((card) => filteredCardsMap[card.id]);
    });
  }, [filteredCards]);

  const onGrade = (score: SrsScore) => {
    if (cards === undefined) {
      return;
    }

    if (cards.length === 0) {
      return;
    }

    const { strategy } = craftTheStrategy({
      studySteps: studySteps,
      card: cards[0],
      allCards,
      prerenderedCards: translationLanguage
        ? getPredefinedMultiChoiceOptions(
            language as GoogleLanguage,
            translationLanguage
          )
        : [],
    });

    update(cards[0].id, grade(cards[0].data, score, strategy)).then(
      async (result) => {
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
      }
    );

    increaseCardsAnsweredToday();
    const followingCards = cards.slice(1);
    setCards(followingCards);
    setCardsStudied((cardsStudied) => cardsStudied + 1);

    if (followingCards.length === 0) {
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
      streakHasShownToday.status !== 'loaded'
    ) {
      return;
    }

    navigation.setOptions({
      headerTitle: '',
      headerRight: () => (
        <>
          {cards.length > 0 && (
            <>
              <IconButton
                icon={'creation'}
                size={24}
                onPress={() =>
                  navigation.navigate('ChatWithCardModal', {
                    card: cards[0].data,
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
                    card: cards[0],
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
  ]);

  if (
    loadDeckStatus === 'loading' ||
    cards === undefined ||
    isRandomizerEnabledResult.status !== 'loaded' ||
    autoPlayResult.status !== 'loaded' ||
    maximumCardsPerSessionResult.status !== 'loaded' ||
    streakHasShownToday.status !== 'loaded'
  ) {
    return <Loader>Loading...</Loader>;
  }

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
          {cards.length > 0 &&
            cards
              .slice(0, 1)
              .map((card) => (
                <Grade
                  key={card.id}
                  card={card}
                  onGrade={onGrade}
                  autoPlay={autoPlayResult.value}
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
              ))}
          {cards.length === 0 && (
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
          {cards.length > 0 && (
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
                }}
              >
                <Text>
                  <Text style={{ color: theme.colors.secondary }}>
                    {cardsStudied + 1}
                  </Text>
                  {' / '}
                  {cardsInTheCurrentSession}
                </Text>
              </View>
            </View>
          )}
        </>
      }
    />
  );
};
