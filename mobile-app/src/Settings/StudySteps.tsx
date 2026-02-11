import { useNavigation } from '@react-navigation/native';
import { CardItem, GoogleLanguage, StudyFlowType } from '@vocably/model';
import { first, get, shuffle } from 'lodash-es';
import { usePostHog } from 'posthog-react-native';
import { FC, useCallback, useContext, useEffect, useState } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { AnimatedRef } from 'react-native-reanimated';
import Sortable, {
  SortableGridDragEndCallback,
  SortableGridRenderItem,
} from 'react-native-sortables';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ImmediateStep } from '../../../packages/srs/src/craftTheStrategy';
import { getMultiChoice } from '../../../packages/srs/src/getMultiChoice';
import { isSuitableForArrangingByLetters } from '../../../packages/srs/src/isSuitableForArrangingByLetters';
import { defaultStudyFlow, getDefaultValues } from '../defaultStudyFlow';
import { useSelectedDeck } from '../languageDeck/useSelectedDeck';
import { getPredefinedMultiChoiceOptions } from '../study/getPredefinedMultiChoiceOptions';
import { useTranslationLanguage } from '../study/useTranslationLanguage';
import { CustomSurface } from '../ui/CustomSurface';
import { PressableScale } from '../ui/PressableScale';
import { usePremium } from '../usePremium';
import { usePresentPaywall } from '../usePresentPaywall';
import { UserMetadataContext } from '../UserMetadataContainer';
import { StudyStepSwitch } from './StudyStepSwitch';

type PreviewStep = {
  card: CardItem;
  step: ImmediateStep;
};

type PreviewOptions = Record<string, PreviewStep>;

type Props = {
  style?: StyleProp<ViewStyle>;
  scrollableRef: AnimatedRef<any>;
};

export const StudySteps: FC<Props> = ({ style, scrollableRef }) => {
  const isPremium = usePremium();
  const presentPaywall = usePresentPaywall();
  const theme = useTheme();
  const { userMetadata, updateUserMetadata } = useContext(UserMetadataContext);
  const [changeIsEnabled, setChangeIsEnabled] = useState(true);
  const navigation = useNavigation();
  const posthog = usePostHog();

  const studyFlow = userMetadata.studyFlow ?? defaultStudyFlow;

  const {
    deck: { language, cards },
  } = useSelectedDeck({
    autoReload: false,
  });
  const translationLanguage = useTranslationLanguage(
    language as GoogleLanguage
  );

  const [previewOptions, setPreviewOptions] = useState<PreviewOptions>({});

  useEffect(() => {
    const prerenderedCards = translationLanguage
      ? getPredefinedMultiChoiceOptions(
          language as GoogleLanguage,
          translationLanguage
        )
      : [];

    const abCard = [...shuffle(cards), ...prerenderedCards].find(
      isSuitableForArrangingByLetters
    );
    const previewOptions: PreviewOptions = {};
    if (abCard) {
      previewOptions.ab = {
        card: abCard,
        step: {
          step: 'ab',
        },
      };
    }

    const swipeCard = first(shuffle(cards)) ?? first(prerenderedCards);

    if (swipeCard) {
      previewOptions.sf = {
        card: swipeCard,
        step: {
          step: 'sf',
        },
      };

      previewOptions.sb = {
        card: swipeCard,
        step: {
          step: 'sb',
        },
      };
    }

    // Multichoice is not working without translations
    const cardsWithTranslation = cards.filter((card) => card.data.translation);

    for (let card of [...shuffle(cardsWithTranslation), ...prerenderedCards]) {
      const multiChoice =
        getMultiChoice(card, cardsWithTranslation) ??
        getMultiChoice(card, prerenderedCards);

      if (multiChoice === null) {
        continue;
      }

      previewOptions['mf'] = {
        card,
        step: {
          step: 'mf',
          multiChoice,
        },
      };

      previewOptions['mb'] = {
        card,
        step: {
          step: 'mb',
          multiChoice,
        },
      };

      break;
    }

    setPreviewOptions(previewOptions);
  }, [cards, translationLanguage, language]);

  useEffect(() => {
    posthog.capture('studyStepsShown');
  }, []);

  const toggleStep = (id: string) => (isEnabled: boolean) => {
    if (!changeIsEnabled) {
      return;
    }

    const item = studyFlow.find((item) => item.id === id);

    if (!item) {
      return;
    }

    setChangeIsEnabled(false);

    item.enabled = isEnabled;

    updateUserMetadata({
      studyFlow: studyFlow,
    }).finally(() => {
      setChangeIsEnabled(true);
    });
  };

  const renderItem = useCallback<SortableGridRenderItem<StudyFlowType>>(
    ({ item }) => {
      const needsPremium = item.type === 'arrange';
      const defaultValues = getDefaultValues(item.id);

      const isEnabled = item.enabled && (!needsPremium || isPremium);
      const previewStep = get(previewOptions, item.id);

      return (
        <CustomSurface
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            paddingHorizontal: 8,
            paddingVertical: 12,
          }}
        >
          <Sortable.Handle
            style={{
              alignSelf: 'stretch',
              justifyContent: 'center',
            }}
          >
            <Icon name="drag-vertical" size={24} />
          </Sortable.Handle>
          <View
            style={{
              gap: 8,
              flex: 1,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                gap: 8,
                alignItems: 'center',
              }}
            >
              <View style={{ paddingRight: 8 }}>
                <StudyStepSwitch
                  value={isEnabled}
                  disabled={needsPremium && !isPremium}
                  readonly={!changeIsEnabled}
                  onValueChange={toggleStep(item.id)}
                />
              </View>
              <View
                style={{
                  gap: 8,
                  flexDirection: 'column',
                  flex: 1,
                  flexShrink: 1,
                }}
              >
                <View>
                  <Text>{defaultValues.name}</Text>
                </View>
                {previewStep && (
                  <PressableScale
                    style={{
                      alignSelf: 'flex-start',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                    }}
                    onPress={() => {
                      posthog.capture('arrangePreviewClicked');
                      navigation.navigate('PreviewStudyStepModal', {
                        card: previewStep.card,
                        step: previewStep.step,
                      });
                    }}
                  >
                    <Icon
                      name="eye-outline"
                      color={theme.colors.primary}
                      size={16}
                    />
                    <Text style={{ fontSize: 16, color: theme.colors.primary }}>
                      Preview
                    </Text>
                  </PressableScale>
                )}
                {needsPremium && !isPremium && (
                  <>
                    <View
                      style={{
                        flexDirection: 'row',
                        gap: 8,
                        alignItems: 'center',
                      }}
                    >
                      <Icon
                        name="lock"
                        size={16}
                        color={theme.colors.onBackground}
                      />
                      <Text style={{ fontSize: 16 }}>
                        Available to premium users
                      </Text>
                    </View>
                    <PressableScale
                      style={{
                        alignSelf: 'flex-start',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                      }}
                      onPress={() => presentPaywall()}
                    >
                      <Icon
                        name="crown"
                        color={theme.colors.primary}
                        size={16}
                      />
                      <Text
                        style={{ fontSize: 16, color: theme.colors.primary }}
                      >
                        Upgrade to Premium
                      </Text>
                    </PressableScale>
                  </>
                )}
              </View>
            </View>
          </View>
        </CustomSurface>
      );
    },
    [isPremium, presentPaywall]
  );

  const onDragEnd: SortableGridDragEndCallback<StudyFlowType> = ({ data }) => {
    setChangeIsEnabled(false);
    updateUserMetadata({
      studyFlow: data,
    }).finally(() => setChangeIsEnabled(true));
  };

  return (
    <View
      style={[
        {
          gap: 16,
        },
        style,
      ]}
    >
      <View style={{ paddingHorizontal: 8, gap: 8 }}>
        <Text style={{ fontSize: 24 }}>Study steps per card</Text>
        <Text>
          Use <Icon name="drag-vertical" /> to rearrange the steps.
        </Text>
      </View>
      <Sortable.Grid
        columns={1}
        data={studyFlow}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        rowGap={8}
        customHandle={true}
        onDragEnd={onDragEnd}
        sortEnabled={changeIsEnabled}
        scrollableRef={scrollableRef}
      />
    </View>
  );
};
