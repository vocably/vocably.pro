import { CardItem, LanguageDeck } from '@vocably/model';
import { omit } from 'lodash-es';
import { buildTagMap } from './buildTagMap';

export type SerializedLanguageDeck = Omit<LanguageDeck, 'cards' | 'tags'> & {
  cards: Array<
    Omit<CardItem, 'data'> & {
      data: Omit<CardItem['data'], 'tags'> & {
        tagIds?: string[];
      };
    }
  >;

  tags?: LanguageDeck['tags'];
};

export const serializeDeck = (deck: LanguageDeck): SerializedLanguageDeck => {
  return {
    ...deck,
    cards: deck.cards.map((card) => ({
      ...card,
      data: {
        ...omit(card.data, 'tags'),
        tagIds: card.data.tags.map((tag) => tag.id),
      },
    })),
  };
};

export const deserializeDeck = (
  serializedDeck: SerializedLanguageDeck
): LanguageDeck => {
  const tagMap = buildTagMap(serializedDeck.tags ?? []);

  return {
    ...serializedDeck,
    cards: serializedDeck.cards.map((card) => ({
      ...card,
      data: {
        ...omit(card.data, 'tagIds'),
        tags: (card.data.tagIds ?? [])
          .filter((tagId) => tagMap[tagId])
          .map((tagId) => tagMap[tagId]),
      },
    })),
    tags: serializedDeck.tags ?? [],
    settings: serializedDeck.settings ?? {},
  };
};
