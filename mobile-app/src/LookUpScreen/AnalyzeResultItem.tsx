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
  onLookUpModalOpen?: () => void;
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
  onLookUpModalOpen,
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
          style={{ flex: 1, paddingVertical: 16 }}
          showExamples={true}
          savingTagsInProgress={isSavingTags}
          onTagsChange={onTagsChange}
          allowCopy={true}
          aiButton={isSharedLookup ? 'none' : 'bright'}
          onLookUpModalOpen={onLookUpModalOpen}
        />
        {!hideOperations && (
          <View
            style={{
              marginTop: 16,
              // To prevent jumping
              height: 90,
            }}
          >
            <IconButton
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
          </View>
        )}
      </View>
    </View>
  );
};
