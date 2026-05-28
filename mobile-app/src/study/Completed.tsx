import { CardItem } from '@vocably/model';
import { sample } from 'lodash-es';
import { usePostHog } from 'posthog-react-native';
import React, { FC, useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import { Button, Text, useTheme } from 'react-native-paper';
import { RequestFeedback } from '../RequestFeedback';
import { Streak } from '../Streak';
import { Displayer } from './Displayer';
import { PADDING_VERTICAL } from './StudyScreen';

const MOTIVATIONAL_QUOTE_COUNT = 28;

type Props = {
  numberOfStudySessions?: number;
  onStudyAgain?: () => void;
  onDone?: () => void;
  cards: CardItem[];
  streakHasBeenShown: boolean;
  streakDays: number;
  onShow: () => void;
  canStudyAgain: boolean;
};

export const Completed: FC<Props> = ({
  onStudyAgain = () => {},
  onDone = () => {},
  numberOfStudySessions,
  cards,
  streakHasBeenShown,
  streakDays,
  onShow,
  canStudyAgain,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [motivationalQuote, setMotivationalQuote] = useState('');

  useEffect(() => {
    const quotes = Array.from({ length: MOTIVATIONAL_QUOTE_COUNT }).map(
      (_, i) => t(`study.motivationalQuotes.${i}`)
    );
    setMotivationalQuote(sample(quotes) as string);
  }, []);

  const posthog = usePostHog();

  useEffect(() => {
    posthog.capture('study_completed');
    onShow();
  }, []);

  return (
    <Displayer style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          paddingBottom: PADDING_VERTICAL,
          minHeight: '100%',
        }}
      >
        <Streak
          consecutiveDays={streakDays}
          hasBeenShown={streakHasBeenShown}
        ></Streak>
        {motivationalQuote.length > 0 && (
          <View style={{ paddingHorizontal: 36, marginBottom: 14 }}>
            <Text
              style={{
                color: theme.colors.onBackground,
                fontSize: 16,
                textAlign: 'center',
              }}
            >
              {motivationalQuote}
            </Text>
          </View>
        )}
        <Button onPress={onDone} mode="contained" style={{ width: 230 }}>
          {t('study.finish')}
        </Button>
        {canStudyAgain && (
          <Button onPress={onStudyAgain} style={{ width: 230 }}>
            {t('study.takeOneMoreRound')}
          </Button>
        )}
        {cards.length > 30 && (
          <RequestFeedback
            numberOfStudySessions={numberOfStudySessions}
            style={{
              paddingHorizontal: 24,
            }}
          />
        )}
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
    </Displayer>
  );
};
