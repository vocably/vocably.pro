import { Card, CardItem, Result, SrsCard, Tag, TagItem } from '@vocably/model';
import { buildTagMap } from '@vocably/model-operations';
import { createSrsItem } from '@vocably/srs';
import { useCallback, useContext, useMemo } from 'react';
import {
  createDefaultLanguageContainerDeck,
  LanguageContainerDeck,
  LanguagesContext,
} from '../languages/LanguagesContainer';

export type Deck = {
  status: LanguageContainerDeck['status'];
  deck: LanguageContainerDeck['deck'];
  add: (card: Card) => Promise<Result<CardItem>>;
  update: (id: string, data: Partial<SrsCard>) => Promise<Result<CardItem>>;
  remove: (id: string) => Promise<Result<unknown>>;
  addTags: (tags: Tag[]) => Promise<Result<TagItem[]>>;
  removeTag: (id: string) => Promise<Result<unknown>>;
  updateTag: (id: string, data: Partial<Tag>) => Promise<Result<TagItem>>;
  filteredCards: LanguageContainerDeck['deck']['cards'];
  selectedTags: TagItem[];
  setSelectedTagIds: (ids: string[]) => Promise<unknown>;
  noTags: boolean;
  setNoTags: (noTags: boolean) => Promise<unknown>;
};

type Options = {
  language: string;
  autoReload: boolean;
};

export const useLanguageDeck = ({ language, autoReload }: Options): Deck => {
  const {
    decks,
    storeDeck,
    addCard: collectionAddCard,
    updateCard: collectionUpdateCard,
    removeCard: collectionRemoveCard,
    addTag: collectionAddTag,
    updateTag: collectionUpdateTag,
    removeTag: collectionRemoveTag,
  } = useContext(LanguagesContext);

  const deck: LanguageContainerDeck =
    decks[language] ?? createDefaultLanguageContainerDeck(language);

  const add = async (card: Card): Promise<Result<CardItem>> => {
    return collectionAddCard(language, {
      ...card,
      ...createSrsItem(),
    });
  };

  const addTags = async (tags: Tag[]): Promise<Result<TagItem[]>> => {
    if (tags.length === 0) {
      return {
        success: true,
        value: [],
      };
    }

    const tagItemsResults = await Promise.all(
      tags.map((tag) => collectionAddTag(language, tag))
    );

    return {
      success: true,
      value: tagItemsResults.reduce<TagItem[]>((acc, tagResult) => {
        if (tagResult.success === false) {
          return acc;
        }

        return [...acc, tagResult.value];
      }, []),
    };
  };

  const removeTag = async (id: string): Promise<Result<unknown>> => {
    return collectionRemoveTag(language, id);
  };

  const updateTag = async (
    id: string,
    data: Partial<Tag>
  ): Promise<Result<TagItem>> => {
    return collectionUpdateTag(language, id, data);
  };

  const update = (
    id: string,
    data: Partial<SrsCard>
  ): Promise<Result<CardItem>> => {
    return collectionUpdateCard(language, id, data);
  };

  const remove = (id: string): Promise<Result<unknown>> => {
    return collectionRemoveCard(language, id);
  };

  const setSelectedTagIds = useCallback(
    async (ids: string[]) => {
      if (!language) {
        return;
      }

      const tagMap = buildTagMap(deck.deck.tags);
      const selectedTags = ids
        .filter((id) => tagMap[id] !== undefined)
        .map((id) => tagMap[id]);

      storeDeck({ ...deck, selectedTags });
    },
    [language, storeDeck, deck]
  );

  const setNoTags = async (noTags: boolean): Promise<unknown> => {
    if (!language) {
      return;
    }

    return storeDeck({ ...deck, noTags });
  };

  const filteredCards = useMemo(() => {
    if (deck.selectedTags.length === 0 && !deck.noTags) {
      return deck.deck.cards;
    }

    const tagMap = buildTagMap(deck.selectedTags);
    return deck.deck.cards.filter((card) => {
      return (
        (deck.noTags && card.data.tags.length === 0) ||
        (deck.selectedTags.length > 0 &&
          card.data.tags.some((cardTag) => !!tagMap[cardTag.id]))
      );
    });
  }, [deck.deck.cards, deck.selectedTags, deck.noTags]);

  return {
    add,
    update,
    remove,
    status: deck.status,
    deck: deck.deck,
    addTags,
    removeTag,
    updateTag,
    selectedTags: deck.selectedTags,
    setSelectedTagIds,
    filteredCards,
    noTags: deck.noTags,
    setNoTags,
  };
};
