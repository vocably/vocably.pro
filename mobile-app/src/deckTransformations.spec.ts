import { CardItem, LanguageDeck, TagItem } from '@vocably/model';
import { createSrsItem } from '@vocably/srs';
import { applyTransformations } from './deckTransformations';

const makeTag = (id: string, title: string): TagItem => ({
  id,
  created: 1,
  data: { title },
});

const makeCard = (
  id: string,
  source: string,
  tags: TagItem[] = []
): CardItem => ({
  id,
  created: 1,
  data: {
    ...createSrsItem(),
    language: 'nl',
    source,
    definition: '',
    translation: '',
    partOfSpeech: 'noun',
    tags,
  },
});

const makeDeck = (): LanguageDeck => {
  const travel = makeTag('t-travel', 'travel');
  const food = makeTag('t-food', 'food');

  return {
    language: 'nl',
    tags: [travel, food],
    cards: [
      makeCard('c-fiets', 'fiets', [travel]),
      makeCard('c-brood', 'brood', [food, travel]),
      makeCard('c-huis', 'huis'),
    ],
  };
};

const tagTitlesOf = (deck: LanguageDeck, cardId: string) =>
  deck.cards
    .find((card) => card.id === cardId)!
    .data.tags.map((tag) => tag.data.title);

describe('applyTransformations', () => {
  it('ignores a card that is already in the deck when replaying "addCard"', () => {
    const deck = applyTransformations(makeDeck(), [
      { type: 'addCard', card: makeCard('c-kaas', 'kaas') },
      { type: 'addCard', card: makeCard('c-kaas', 'kaas') },
    ]);

    expect(deck.cards.map((card) => card.id)).toEqual([
      'c-fiets',
      'c-brood',
      'c-huis',
      'c-kaas',
    ]);
  });

  it('merges partial data into the card on "updateCard"', () => {
    const deck = applyTransformations(makeDeck(), [
      { type: 'updateCard', id: 'c-huis', data: { translation: 'house' } },
    ]);

    const huis = deck.cards.find((card) => card.id === 'c-huis')!;
    expect(huis.data.translation).toBe('house');
    expect(huis.data.source).toBe('huis');
    expect(huis.updated).toEqual(expect.any(Number));
  });

  it('renames a tag on every card that carries it', () => {
    const deck = applyTransformations(makeDeck(), [
      { type: 'updateTag', id: 't-travel', data: { title: 'trips' } },
    ]);

    expect(deck.tags.map((tag) => tag.data.title)).toEqual(['trips', 'food']);
    expect(tagTitlesOf(deck, 'c-fiets')).toEqual(['trips']);
    expect(tagTitlesOf(deck, 'c-brood')).toEqual(['food', 'trips']);
  });

  it('leaves the deck untouched when the tag to update does not exist', () => {
    const deck = applyTransformations(makeDeck(), [
      { type: 'updateTag', id: 't-missing', data: { title: 'nope' } },
    ]);

    expect(deck.tags.map((tag) => tag.data.title)).toEqual(['travel', 'food']);
    expect(tagTitlesOf(deck, 'c-brood')).toEqual(['food', 'travel']);
  });

  it('detaches a removed tag from every card', () => {
    const deck = applyTransformations(makeDeck(), [
      { type: 'removeTag', id: 't-travel' },
    ]);

    expect(deck.tags.map((tag) => tag.id)).toEqual(['t-food']);
    expect(tagTitlesOf(deck, 'c-fiets')).toEqual([]);
    expect(tagTitlesOf(deck, 'c-brood')).toEqual(['food']);
  });

  it('replays a sequence of offline edits in order', () => {
    const work = makeTag('t-work', 'work');

    const deck = applyTransformations(makeDeck(), [
      { type: 'removeCard', id: 'c-fiets' },
      { type: 'addTag', tag: work },
      { type: 'addCard', card: makeCard('c-baan', 'baan', [work]) },
      { type: 'updateTag', id: 't-work', data: { title: 'job' } },
      { type: 'updateSettings', data: { hideDefinitions: true } },
    ]);

    expect(deck.cards.map((card) => card.id)).toEqual([
      'c-brood',
      'c-huis',
      'c-baan',
    ]);
    expect(tagTitlesOf(deck, 'c-baan')).toEqual(['job']);
    expect(deck.settings).toEqual({ hideDefinitions: true });
  });

  it('returns new card and tag arrays so React sees the change', () => {
    const original = makeDeck();
    const { cards, tags } = original;

    const deck = applyTransformations(original, [
      { type: 'removeCard', id: 'c-huis' },
    ]);

    expect(deck.cards).not.toBe(cards);
    expect(deck.tags).not.toBe(tags);
  });
});
