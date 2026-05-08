import { NavigationProp, Route } from '@react-navigation/native';
import { CardItem, DeckSettings } from '@vocably/model';
import React, { FC } from 'react';
import { View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ImmediateStep } from '../../../packages/srs/src/craftTheStrategy';
import { ArrangeByLetters } from '../study/ArrangeByLetters';
import { Card } from '../study/Card';
import { MultiChoice } from '../study/MultiChoice';
import { SwipeGrade } from '../study/SwipeGrade';
import { ScreenLayout } from '../ui/ScreenLayout';

type PreviewParams = {
  card: CardItem;
  step: ImmediateStep;
  deckSettings: DeckSettings;
};

type Props = {
  route: Route<string, any>;
  navigation: NavigationProp<any>;
};

export const PreviewStudyStepModal: FC<Props> = ({ route, navigation }) => {
  const { card, step, deckSettings } = route.params as PreviewParams;

  if (!card || !step || !deckSettings) {
    navigation.goBack();
    return;
  }

  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const onGrade = () => {
    setTimeout(
      () => navigation.goBack(),
      ['ab', 'mf', 'mb'].includes(step.step) ? 100 : 0
    );
  };

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
          {step.step === 'sf' && (
            <SwipeGrade onGrade={onGrade}>
              <Card
                playRandomExample={false}
                deckSettings={deckSettings}
                autoPlay={false}
                card={card}
                direction="front"
              />
            </SwipeGrade>
          )}
          {step.step === 'sb' && (
            <SwipeGrade onGrade={onGrade}>
              <Card
                playRandomExample={false}
                deckSettings={deckSettings}
                autoPlay={false}
                card={card}
                direction="back"
              />
            </SwipeGrade>
          )}
          {step.step === 'ab' && (
            <ArrangeByLetters
              deckSettings={deckSettings}
              card={card}
              onGrade={onGrade}
            />
          )}
          {step.step === 'mf' && (
            <MultiChoice
              playRandomExample={false}
              deckSettings={deckSettings}
              autoPlay={false}
              card={card}
              onGrade={onGrade}
              alternatives={step.multiChoice}
              direction="front"
            />
          )}
          {step.step === 'mb' && (
            <MultiChoice
              playRandomExample={false}
              deckSettings={deckSettings}
              autoPlay={false}
              card={card}
              onGrade={onGrade}
              alternatives={step.multiChoice}
              direction="back"
            />
          )}
        </View>
      }
      footer={
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
              <Text style={{ color: theme.colors.secondary }}>1</Text>
              {' / '}1
            </Text>
          </View>
        </View>
      }
    />
  );
};
