import { CardItem, CardsLimit, Result, TagItem } from '@vocably/model';
import { getAddedToday } from '@vocably/model-operations';
import { usePostHog } from 'posthog-react-native';
import React, { FC, useState } from 'react';
import { PixelRatio, Platform, StyleProp, View, ViewStyle } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';
import { CardListItem } from '../CardListItem';
import { Deck } from '../languageDeck/useLanguageDeck';
import { mainPadding } from '../styles';
import { TagsSelector } from '../TagsSelector';
import { AddLimitationMessage } from './AddLimitationMessage';
import { AssociatedCard } from './associateCards';
import { CardVoteButton, CardVoteContext } from './CardVoteButton';

type AnalyzeResultItem = FC<{
  onAdd: (card: AssociatedCard) => Promise<Result<CardItem>>;
  onRemove: (card: AssociatedCard) => Promise<Result<unknown>>;
  onTagsChange: (id: string, tags: TagItem[]) => Promise<Result<unknown>>;
  item: AssociatedCard;
  deck: Deck;
  hideOperations?: boolean;
  leftInset?: number;
  rightInset?: number;
  cardsLimit?: CardsLimit;
  style?: StyleProp<ViewStyle>;
  isSharedLookup?: boolean;
  // Shows the card quality vote button when present.
  voteContext?: CardVoteContext;
}>;

export const AnalyzeResultItem: AnalyzeResultItem = ({
  onAdd,
  onRemove,
  onTagsChange: onTagsChangePropFunction,
  item,
  deck,
  hideOperations = false,
  leftInset = 0,
  rightInset = 0,
  cardsLimit = 'unlimited',
  style,
  isSharedLookup = false,
  voteContext,
}) => {
  const theme = useTheme();
  const [isProcessing, setIsProcessing] = useState(false);

  const canAdd =
    cardsLimit === 'unlimited' ||
    cardsLimit.maxCards > deck.deck.cards.length ||
    getAddedToday(deck.deck.cards, new Date()).length < cardsLimit.cardsPerDay;

  const [isBannerVisible, setIsBannerVisible] = useState(false);

  const posthog = usePostHog();

  const toggleCard = async () => {
    if (isProcessing) {
      return;
    }

    setIsProcessing(true);
    if (item.id) {
      await onRemove(item);
      setIsBannerVisible(false);
    } else if (canAdd) {
      await onAdd(item);
    } else {
      posthog.capture('limitation-showed');
      setIsBannerVisible(true);
    }
    setIsProcessing(false);
  };

  const [isSavingTags, setIsSavingTags] = useState(false);

  const onTagsChange = async (newTags: TagItem[]) => {
    if (!item.id) {
      return;
    }
    if (item.card.tags.length === 0 && newTags.length === 0) {
      return;
    }
    setIsSavingTags(true);
    await onTagsChangePropFunction(item.id, newTags);
    setIsSavingTags(false);
  };

  const fontScale = PixelRatio.getFontScale();

  return (
    <View style={style}>
      {!canAdd && isBannerVisible && (
        <AddLimitationMessage
          leftInset={leftInset}
          rightInset={rightInset}
          cards={deck.deck.cards}
          maxCards={cardsLimit}
          isSharedLookup={isSharedLookup}
        />
      )}
      <View
        style={{
          alignItems: 'flex-start',
          justifyContent: 'center',
          flexDirection: 'row',
          paddingLeft: leftInset + mainPadding,
          // Align ⊕ button with the 🔎
          paddingRight: rightInset + 16,
        }}
      >
        <CardListItem
          card={item.card}
          style={{ flex: 1, paddingTop: 12, paddingBottom: 16 }}
          showExamples={true}
          savingTagsInProgress={isSavingTags}
          onTagsChange={onTagsChange}
          allowCopy={true}
          aiButton={isSharedLookup ? 'none' : 'dimmed'}
          disabledModalLookup={isSharedLookup}
          showFrequency={true}
          isSharedLookup={isSharedLookup}
        />
        {!hideOperations && (
          <View
            style={{
              marginTop: Platform.OS === 'android' ? 12 : 10,
              // Stretches to the card height, so the vote button sits at the
              // bottom of the card.
              alignSelf: 'stretch',
              // To prevent jumping when the tags button appears
              minHeight: (voteContext ? 3 : 2) * (24 * fontScale + 16) + 10,
            }}
          >
            <IconButton
              testID={`analyze-result-toggle-${item.card.source}`}
              icon={!item.id ? 'plus-circle-outline' : 'bookmark-check'}
              animated={Platform.OS !== 'android'}
              iconColor={theme.colors.primary}
              onPress={toggleCard}
              style={{ margin: 0 }}
              size={24 * fontScale}
            />
            {item.id && (
              <TagsSelector
                value={item.card.tags}
                onChange={onTagsChange}
                deck={deck}
                renderAnchor={({ openMenu, disabled }) => (
                  <IconButton
                    testID={`analyze-result-tags-${item.card.source}`}
                    icon={'tag-plus'}
                    iconColor={theme.colors.primary}
                    onPress={openMenu}
                    disabled={disabled}
                    style={{ margin: 0 }}
                    size={24 * fontScale}
                  />
                )}
              />
            )}
            {voteContext && (
              // The card has 16px bottom padding, the button has 8px of its
              // own, so the icon lines up with the bottom of the card content.
              <View style={{ marginTop: 'auto', paddingBottom: 8 }}>
                <CardVoteButton card={item.card} context={voteContext} />
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
};
