import { Card, GoogleLanguage } from '@vocably/model';
import { usePostHog } from 'posthog-react-native';
import React, { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  Easing,
  Modal,
  PanResponder,
  PixelRatio,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { IconButton } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mainPadding } from '../styles';
import { useAppTheme } from '../ThemeProvider';
import { ModalSafeAreaProvider } from '../ui/ModalSafeAreaProvider';
import { CardVote, CardVoteContent } from './CardVoteContent';

/**
 * What the card was created from. Sent along with the vote.
 */
export type CardVoteContext = {
  cards: Card[];
  query: string;
  sourceLanguage: GoogleLanguage;
  targetLanguage: GoogleLanguage;
  direction: 'direct' | 'reverse';
};

type Props = {
  card: Card;
  context: CardVoteContext;
};

const OPEN_DURATION = 260;
const CLOSE_DURATION = 200;
// The drawer closes this long after the vote, so the checkmark is seen.
const CLOSE_AFTER_VOTE_DELAY = 1000;
const MAX_HEIGHT_RATIO = 0.85;
const DISMISS_DISTANCE = 80;
const DISMISS_VELOCITY = 0.8;

/**
 * An icon button that opens a bottom drawer asking the user to rate the
 * quality of the card. The drawer mirrors the one of `FrequencyHint`.
 */
export const CardVoteButton: FC<Props> = ({ card, context }) => {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const posthog = usePostHog();
  const { height: screenHeight } = useWindowDimensions();
  const fontScale = PixelRatio.getFontScale();

  const [visible, setVisible] = useState(false);
  // The modal stays mounted while the drawer slides out.
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [vote, setVote] = useState<CardVote | null>(null);
  const progress = useRef(new Animated.Value(0)).current;
  const dragY = useRef(new Animated.Value(0)).current;
  // An animated value rather than state, so a layout change doesn't re-render
  // the drawer in the middle of the animation.
  const drawerHeight = useRef(new Animated.Value(screenHeight)).current;
  const translateY = useRef(
    Animated.add(
      Animated.multiply(Animated.subtract(1, progress), drawerHeight),
      dragY
    )
  ).current;
  // The drawer slides in only once it's laid out, so it starts from its real
  // height instead of jumping mid-animation.
  const isLaidOutRef = useRef(false);
  const isOpenPendingRef = useRef(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  const close = () => {
    clearTimeout(closeTimeoutRef.current);
    setVisible(false);
  };
  const closeRef = useRef(close);
  closeRef.current = close;

  useEffect(() => () => clearTimeout(closeTimeoutRef.current), []);

  const open = () => {
    isOpenPendingRef.current = false;
    Animated.timing(progress, {
      toValue: 1,
      duration: OPEN_DURATION,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const onDrawerLayout = (height: number) => {
    drawerHeight.setValue(height);
    isLaidOutRef.current = true;
    if (isOpenPendingRef.current) {
      open();
    }
  };

  useEffect(() => {
    if (visible) {
      setIsModalVisible(true);
      dragY.setValue(0);
      // Reopened before the drawer finished closing.
      if (isLaidOutRef.current) {
        open();
      } else {
        isOpenPendingRef.current = true;
      }
      return;
    }

    isOpenPendingRef.current = false;

    Animated.timing(progress, {
      toValue: 0,
      duration: CLOSE_DURATION,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setIsModalVisible(false);
        isLaidOutRef.current = false;
      }
    });
  }, [visible, progress, dragY]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, { dy, dx }) =>
        dy > 4 && Math.abs(dy) > Math.abs(dx),
      onPanResponderMove: (_, { dy }) => dragY.setValue(Math.max(dy, 0)),
      onPanResponderRelease: (_, { dy, vy }) => {
        if (dy > DISMISS_DISTANCE || vy > DISMISS_VELOCITY) {
          closeRef.current();
          return;
        }

        Animated.spring(dragY, {
          toValue: 0,
          bounciness: 4,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderTerminate: () => {
        Animated.spring(dragY, { toValue: 0, useNativeDriver: true }).start();
      },
    })
  ).current;

  const onVote = (pressedVote: CardVote) => {
    // Pressing the selected button again unchecks it.
    const newVote = vote === pressedVote ? null : pressedVote;

    setVote(newVote);
    posthog.capture('cardQualityVoted', {
      // null when the user takes their vote back.
      vote: newVote,
      // Set when the user changes their mind.
      previousVote: vote,
      card,
      cards: context.cards,
      query: context.query,
      sourceLanguage: context.sourceLanguage,
      targetLanguage: context.targetLanguage,
      direction: context.direction,
    });
    clearTimeout(closeTimeoutRef.current);
    // After unchecking, the drawer stays open, so the user can vote again.
    if (newVote === null) {
      return;
    }
    closeTimeoutRef.current = setTimeout(
      () => setVisible(false),
      CLOSE_AFTER_VOTE_DELAY
    );
  };

  return (
    <>
      <IconButton
        testID={`analyze-result-vote-${card.source}`}
        icon={vote === null ? 'thumbs-up-down-outline' : 'thumbs-up-down'}
        iconColor={theme.colors.tertiary}
        onPress={() => setVisible(true)}
        accessibilityLabel={t('cardVote.accessibilityLabel')}
        style={{ margin: 0 }}
        size={24 * fontScale}
      />
      <Modal
        visible={isModalVisible}
        transparent
        animationType="none"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={close}
      >
        <ModalSafeAreaProvider>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: theme.colors.backdrop, opacity: progress },
            ]}
          >
            <Pressable
              testID="card-vote-backdrop"
              style={StyleSheet.absoluteFill}
              onPress={close}
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
            />
          </Animated.View>
          <Animated.View
            accessibilityViewIsModal
            onLayout={(event) =>
              onDrawerLayout(event.nativeEvent.layout.height)
            }
            style={[
              styles.drawer,
              {
                maxHeight: screenHeight * MAX_HEIGHT_RATIO,
                backgroundColor: theme.colors.elevation.level1,
                transform: [{ translateY }],
              },
            ]}
          >
            <View {...panResponder.panHandlers} style={styles.handleArea}>
              <View
                style={[
                  styles.handle,
                  { backgroundColor: theme.colors.onSurfaceVariant },
                ]}
              />
            </View>
            <ScrollView
              bounces={false}
              style={styles.content}
              contentContainerStyle={styles.contentContainer}
            >
              <CardVoteContent vote={vote} onVote={onVote} />
            </ScrollView>
            <BottomInset />
          </Animated.View>
        </ModalSafeAreaProvider>
      </Modal>
    </>
  );
};

const BottomInset: FC = () => {
  const insets = useSafeAreaInsets();
  return <View style={{ height: insets.bottom }} />;
};

const styles = StyleSheet.create({
  drawer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 16,
  },
  handleArea: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 32,
    height: 4,
    borderRadius: 2,
    opacity: 0.4,
  },
  content: {
    flexGrow: 0,
    flexShrink: 1,
  },
  contentContainer: {
    paddingHorizontal: mainPadding,
    paddingTop: 8,
    paddingBottom: 16,
  },
});
