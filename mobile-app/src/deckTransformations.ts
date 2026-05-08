import { makeDelete, makeUpdate } from '@vocably/crud';
import {
  CardItem,
  DeckSettings,
  LanguageDeck,
  SrsCard,
  Tag,
  TagItem,
} from '@vocably/model';

export type TransformationAddCard = {
  type: 'addCard';
  card: CardItem;
};

export type TransformationUpdateCard = {
  type: 'updateCard';
  id: string;
  data: Partial<SrsCard>;
};

export type TransformationRemoveCard = {
  type: 'removeCard';
  id: string;
};

export type TransformationAddTag = {
  type: 'addTag';
  tag: TagItem;
};

export type TransformationUpdateTag = {
  type: 'updateTag';
  id: string;
  data: Partial<Tag>;
};

export type TransformationRemoveTag = {
  type: 'removeTag';
  id: string;
};

export type TransformationUpdateSettings = {
  type: 'updateSettings';
  data: DeckSettings;
};

export type LanguageDeckTransformation =
  | TransformationAddCard
  | TransformationUpdateCard
  | TransformationRemoveCard
  | TransformationAddTag
  | TransformationRemoveTag
  | TransformationUpdateTag
  | TransformationUpdateSettings;

export const applyTransformation = (
  deck: LanguageDeck,
  transformation: LanguageDeckTransformation
): LanguageDeck => {
  if (transformation.type === 'addCard') {
    const cardAlreadyExists = deck.cards.some(
      (c) => c.id === transformation.card.id
    );
    if (!cardAlreadyExists) {
      deck.cards.push(transformation.card);
    }
  }

  if (transformation.type === 'updateCard') {
    makeUpdate(deck.cards)(transformation.id, transformation.data);
  }

  if (transformation.type === 'removeCard') {
    makeDelete(deck.cards)(transformation.id);
  }

  if (transformation.type === 'addTag') {
    deck.tags.push(transformation.tag);
  }

  if (transformation.type === 'updateTag') {
    const updateResult = makeUpdate(deck.tags)(
      transformation.id,
      transformation.data
    );
    if (updateResult.success === false) {
      return deck;
    }

    deck.cards.forEach((card) => {
      card.data.tags = card.data.tags.map((t) => {
        if (t.id === transformation.id) {
          return updateResult.value;
        } else {
          return t;
        }
      });
    });
  }

  if (transformation.type === 'removeTag') {
    makeDelete(deck.tags)(transformation.id);
    deck.cards.forEach((card) => {
      card.data.tags = card.data.tags.filter((t) => t.id !== transformation.id);
    });
  }

  if (transformation.type === 'updateSettings') {
    deck.settings = transformation.data;
  }

  return {
    ...deck,
    tags: [...deck.tags],
    cards: [...deck.cards],
  };
};

export const applyTransformations = (
  deck: LanguageDeck,
  transformations: LanguageDeckTransformation[]
): LanguageDeck => {
  return transformations.reduce(applyTransformation, deck);
};
