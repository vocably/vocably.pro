import { loadLanguageDeck, saveLanguageDeck } from '@vocably/api';
import { isItem, makeCreate, makeDelete, makeUpdate } from '@vocably/crud';
import {
  AddCardPayload,
  AttachTagPayload,
  DeleteTagPayload,
  DetachTagPayload,
  isCardItem,
  LanguageDeck,
  RemoveCardPayload,
  Result,
  TranslationCards,
  UpdateCardPayload,
  UpdateTagPayload,
} from '@vocably/model';
import { buildTagMap, updateDetachedCard } from '@vocably/model-operations';
import { createSrsItem } from '@vocably/srs';
import { uniq } from 'lodash-es';
import { getLastUsedTagsIds, saveLastUsedTagsIds } from './lastUsedTags';

/**
 * Card and tag operations for the website, ported from the extension's service
 * worker (`packages/extension-service-worker/src/index.ts`). The extension
 * wraps them in message passing only because its content script cannot reach
 * the network; the website calls them directly.
 *
 * There is no per card endpoint: the backend stores one document per language,
 * so every operation loads the whole deck, mutates it, and saves it back. Like
 * the extension, this is last writer wins across devices.
 */

type Mutation = (deck: LanguageDeck) => Result<unknown> | void;

const mutateDeck = async (
  translationCards: TranslationCards,
  mutate: Mutation
): Promise<Result<TranslationCards>> => {
  const deckResult = await loadLanguageDeck(translationCards.sourceLanguage);

  if (deckResult.success === false) {
    return deckResult;
  }

  const mutationResult = mutate(deckResult.value);

  if (mutationResult && mutationResult.success === false) {
    return mutationResult;
  }

  const saveResult = await saveLanguageDeck(deckResult.value);

  if (saveResult.success === false) {
    return saveResult;
  }

  // `vocably-translation` re-renders from the deck it is handed back, which is
  // how a freshly added card turns into a removable one.
  return {
    success: true,
    value: {
      ...translationCards,
      deck: deckResult.value,
    },
  };
};

export const addCard = ({
  translationCards,
  card,
}: AddCardPayload): Promise<Result<TranslationCards>> =>
  mutateDeck(translationCards, (deck) => {
    const tagMap = buildTagMap(deck.tags);
    const tags = uniq(getLastUsedTagsIds())
      .filter((tagId) => tagMap[tagId])
      .map((tagId) => tagMap[tagId]);

    saveLastUsedTagsIds(tags.map((tag) => tag.id));

    makeCreate(deck.cards)({
      ...createSrsItem(),
      ...card.data,
      tags,
    });
  });

export const removeCard = ({
  translationCards,
  card,
}: RemoveCardPayload): Promise<Result<TranslationCards>> =>
  mutateDeck(translationCards, (deck) => {
    makeDelete(deck.cards)(card.id);
  });

export const updateCard = async (
  payload: UpdateCardPayload
): Promise<Result<TranslationCards>> => {
  const { translationCards, card, data } = payload;

  // A card that has not been added yet exists only in the analysis result, so
  // editing it touches nothing on the server.
  if (!isCardItem(card)) {
    return updateDetachedCard({ ...payload, card });
  }

  return mutateDeck(translationCards, (deck) =>
    makeUpdate(deck.cards)(card.id, data)
  );
};

export const attachTag = ({
  translationCards,
  cardId,
  tag,
}: AttachTagPayload): Promise<Result<TranslationCards>> =>
  mutateDeck(translationCards, (deck) => {
    // The tags menu sends an existing `TagItem` when a tag is picked, and a
    // bare `{ data }` candidate when the user types a new one.
    const tagItem = isItem(tag)
      ? deck.tags.find((deckTag) => deckTag.id === tag.id)
      : makeCreate(deck.tags)(tag.data);

    if (tagItem === undefined) {
      return {
        success: false,
        errorCode: 'UNABLE_TO_COMPLETE_TAG_OPERATION',
        reason: 'Unable to find tag in the collection',
        extra: { cardId, tag },
      };
    }

    const card = deck.cards.find((deckCard) => deckCard.id === cardId);

    if (card === undefined) {
      return {
        success: false,
        errorCode: 'UNABLE_TO_COMPLETE_TAG_OPERATION',
        reason: `Unable to find card with ID ${cardId}`,
        extra: { cardId, tag },
      };
    }

    if (!card.data.tags.some((cardTag) => cardTag.id === tagItem.id)) {
      card.data.tags.push(tagItem);
    }

    saveLastUsedTagsIds(card.data.tags.map((cardTag) => cardTag.id));
  });

export const detachTag = ({
  translationCards,
  cardId,
  tag,
}: DetachTagPayload): Promise<Result<TranslationCards>> =>
  mutateDeck(translationCards, (deck) => {
    const card = deck.cards.find((deckCard) => deckCard.id === cardId);

    if (card === undefined) {
      return {
        success: false,
        errorCode: 'UNABLE_TO_COMPLETE_TAG_OPERATION',
        reason: `Unable to find card with ID ${cardId}`,
        extra: { cardId, tag },
      };
    }

    card.data.tags = card.data.tags.filter((cardTag) => cardTag.id !== tag.id);

    saveLastUsedTagsIds(card.data.tags.map((cardTag) => cardTag.id));
  });

export const updateTag = ({
  translationCards,
  tag,
}: UpdateTagPayload): Promise<Result<TranslationCards>> =>
  mutateDeck(translationCards, (deck) => {
    const updateResult = makeUpdate(deck.tags)(tag.id, tag.data);

    if (updateResult.success === false) {
      return updateResult;
    }

    // Cards carry their own copy of each tag, so a rename has to reach them
    // too, the way the mobile app's `applyTransformation` does. The extension's
    // own handler skips this and leaves the old title on the card until the
    // deck is reloaded.
    deck.cards.forEach((card) => {
      card.data.tags = card.data.tags.map((cardTag) =>
        cardTag.id === tag.id ? updateResult.value : cardTag
      );
    });
  });

export const deleteTag = ({
  translationCards,
  tag,
}: DeleteTagPayload): Promise<Result<TranslationCards>> =>
  mutateDeck(translationCards, (deck) => {
    const deleteResult = makeDelete(deck.tags)(tag.id);

    if (deleteResult.success === false) {
      return deleteResult;
    }

    deck.cards.forEach((card) => {
      card.data.tags = card.data.tags.filter(
        (cardTag) => cardTag.id !== tag.id
      );
    });
  });
