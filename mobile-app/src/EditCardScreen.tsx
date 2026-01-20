import { SHOW_SRS_STATS } from '@env';
import { NavigationProp, Route } from '@react-navigation/native';
import { CardItem, TagItem } from '@vocably/model';
import { createSrsItem } from '@vocably/srs';
import { isNew } from '@vocably/srs/dist/esm/isNew';
import React, {
  FC,
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import { Alert, View } from 'react-native';
import { Button, Chip, Text, useTheme } from 'react-native-paper';
import { CardForm } from './CardForm';
import { useLanguageDeck } from './languageDeck/useLanguageDeck';
import { Loader } from './loaders/Loader';
import { TagsSelector } from './TagsSelector';
import { CustomScrollView } from './ui/CustomScrollView';
import { CustomSurface } from './ui/CustomSurface';

export type EditCardParams = {
  card: CardItem;
};

type Props = {
  route: Route<string, any>;
  navigation: NavigationProp<any>;
};

export const EditCardScreen: FC<Props> = ({ route, navigation }) => {
  const { card } = route.params as EditCardParams;

  const deck = useLanguageDeck({
    language: card.data.language,
    autoReload: false,
  });

  const [cardData, setCardData] = useState({ ...card.data });
  const [isUpdating, setIsUpdating] = useState(false);
  const [savingTags, setSavingTags] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResettingStudyProgress, setResettingStudyProgress] = useState(false);
  const [hasReset, setHasReset] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    setCardData({ ...card.data });
  }, [card]);

  const onUpdate = useCallback(async () => {
    setIsUpdating(true);
    const updateResult = await deck.update(card.id, cardData);
    if (updateResult.success === false) {
      Alert.alert(
        'Error: Card update failed',
        `Oops! Something went wrong while attempting to update the card. Please try again.`
      );
    }
    navigation.goBack();
  }, [cardData, deck.update, card]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          loading={isUpdating}
          disabled={isUpdating}
          onPress={onUpdate}
          style={{ marginRight: 8 }}
          textColor={theme.colors.primary}
          buttonColor={theme.colors.background}
        >
          Save
        </Button>
      ),
    });
  }, [navigation, isUpdating, onUpdate]);

  const onTagsChange = async (tags: TagItem[]) => {
    cardData.tags = tags;
    setSavingTags(true);
    const updateResult = await deck.update(card.id, cardData);
    setSavingTags(false);
    if (updateResult.success === false) {
      Alert.alert(
        'Error: Card update failed',
        `Oops! Something went wrong while attempting to update the card. Please try again.`
      );
    }
  };

  const onDelete = async () => {
    Alert.alert(
      'Delete this card?',
      'This operation can not be undone.',
      [
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            const deleteResult = await deck.remove(card.id);
            if (deleteResult.success === false) {
              setIsDeleting(false);
              Alert.alert('Unable to delete the card. Please try again.');
              return;
            }
            navigation.goBack();
          },
        },
        { text: 'Cancel', onPress: () => {} },
      ],
      { cancelable: true }
    );
  };

  if (isDeleting) {
    return (
      <View style={{ flex: 1 }}>
        <Loader>Deleting card...</Loader>
      </View>
    );
  }

  const resetStudyProgress = () => {
    Alert.alert(
      'Reset study progress?',
      'This operation can not be undone.',
      [
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            setResettingStudyProgress(true);

            const srsItemValues = {
              lastStudied: undefined,
              state: undefined,
              ...createSrsItem(),
            };
            const updateResult = await deck.update(card.id, srsItemValues);

            setResettingStudyProgress(false);

            if (updateResult.success === false) {
              setIsDeleting(false);
              Alert.alert('Unable to reset study progress. Please try again.');
              return;
            }

            setCardData((cardData) => ({
              ...cardData,
              ...srsItemValues,
            }));
            setHasReset(true);
          },
        },
        { text: 'Cancel', onPress: () => {} },
      ],
      { cancelable: true }
    );
  };

  return (
    <CustomScrollView automaticallyAdjustKeyboardInsets={true}>
      <View style={{ gap: 16 }}>
        <View
          style={{
            alignItems: 'flex-start',
          }}
        >
          <TagsSelector
            value={cardData.tags}
            onChange={onTagsChange}
            deck={deck}
            renderAnchor={({ openMenu, disabled }) => (
              <Button
                onPress={openMenu}
                disabled={disabled}
                icon={'tag'}
                loading={savingTags}
              >
                Add or remove card tags (folders)
              </Button>
            )}
          />
          {cardData.tags.length > 0 && (
            <View
              style={{
                marginTop: 8,
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 8,
                minHeight: 36,
              }}
            >
              {cardData.tags.map((tag) => (
                <Chip
                  key={tag.id}
                  selectedColor={theme.colors.outlineVariant}
                  mode="outlined"
                  onClose={() =>
                    onTagsChange(cardData.tags.filter((t) => t.id !== tag.id))
                  }
                >
                  {tag.data.title}
                </Chip>
              ))}
            </View>
          )}
        </View>

        <CardForm
          card={cardData}
          onChange={(newCardData) => {
            setCardData({
              ...cardData,
              ...newCardData,
            });
          }}
        />

        <View style={{ flexDirection: 'row', marginTop: 24 }}>
          <Button
            icon={'delete'}
            textColor={theme.colors.error}
            onPress={onDelete}
          >
            Delete
          </Button>
          {
            <Button
              style={{ marginLeft: 'auto' }}
              disabled={isNew(card) || hasReset || isResettingStudyProgress}
              loading={isResettingStudyProgress}
              onPress={resetStudyProgress}
            >
              Reset study progress
            </Button>
          }
        </View>
        {SHOW_SRS_STATS === 'true' && (
          <CustomSurface
            style={{
              marginTop: 8,
              backgroundColor: theme.colors.elevation.level2,
              padding: 16,
            }}
            elevation={0}
          >
            <Text>Raw Card Data (Visible in Dev Mode only)</Text>

            <Text>
              {JSON.stringify(
                {
                  ...card,
                  createdIso: new Date(card.created).toISOString(),
                  updatedIso:
                    card.updated && new Date(card.updated).toISOString(),
                },
                null,
                4
              )}
            </Text>
          </CustomSurface>
        )}
      </View>
    </CustomScrollView>
  );
};
