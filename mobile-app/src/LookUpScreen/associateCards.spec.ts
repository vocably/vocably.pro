import { Analysis, CardItem, TagItem } from '@vocably/model';
import { createSrsItem } from '@vocably/srs';
import { associateCards } from './associateCards';
import { makeCards } from './makeCards';

const analysis: Analysis = {
  source: 'Bank',
  sourceLanguage: 'de',
  targetLanguage: 'en',
  isDirect: true,
  detectedInputType: 'word',
  translation: {
    source: 'Bank',
    sourceLanguage: 'de',
    target: 'bank',
    targetLanguage: 'en',
  },
  items: [
    {
      source: 'die Bank',
      ipa: 'baŋk',
      partOfSpeech: 'noun',
      definitions: ['a financial institution', 'a long seat'],
      examples: ['Ich gehe zur Bank.'],
      translation: 'bank, bench',
      g: 'f',
      pluralForm: 'Banken',
      frequency: 8,
    },
    {
      source: 'bank',
      definitions: [],
      translation: 'bench (colloquial)',
    },
  ],
};

const tag: TagItem = { id: 'tag-money', created: 1, data: { title: 'money' } };

const existingCard = (
  id: string,
  source: string,
  partOfSpeech: string,
  tags: TagItem[]
): CardItem => ({
  id,
  created: 1,
  data: {
    ...createSrsItem(),
    language: 'de',
    source,
    partOfSpeech,
    definition: '',
    translation: '',
    tags,
  },
});

describe('makeCards', () => {
  it('turns every analysis item into an untagged card', () => {
    const [noun, unknown] = makeCards(analysis);

    expect(noun).toMatchObject({
      language: 'de',
      source: 'die Bank',
      ipa: 'baŋk',
      partOfSpeech: 'noun',
      translation: 'bank, bench',
      g: 'f',
      pluralForm: 'Banken',
      frequency: 8,
      tags: [],
    });
    expect(noun.definition).toContain('a financial institution');
    expect(noun.definition).toContain('a long seat');
    expect(noun.example).toContain('Ich gehe zur Bank.');

    // Optional analysis fields become empty strings, so the card form
    // always has a value to edit.
    expect(unknown).toMatchObject({
      source: 'bank',
      ipa: '',
      partOfSpeech: '',
      definition: '',
      example: '',
    });
    expect(unknown).not.toHaveProperty('frequency');
  });
});

describe('associateCards', () => {
  it('links a looked up card to the saved one with the same word and part of speech', () => {
    const cards = makeCards(analysis);
    const saved = [existingCard('saved-1', 'Die BANK', 'noun', [tag])];

    const [noun, unknown] = associateCards(cards, saved);

    expect(noun.id).toBe('saved-1');
    expect(noun.card.tags).toEqual([tag]);
    // Only the tags come from the saved card, the content is the fresh lookup.
    expect(noun.card.translation).toBe('bank, bench');

    expect(unknown).toEqual({ id: null, card: cards[1] });
  });

  it('does not link a card when the part of speech differs', () => {
    const cards = makeCards(analysis);
    const saved = [existingCard('saved-1', 'die Bank', 'verb', [tag])];

    const [noun] = associateCards(cards, saved);

    expect(noun.id).toBeNull();
    expect(noun.card.tags).toEqual([]);
  });
});
