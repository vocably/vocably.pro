import { LanguageDeck } from '@vocably/model';
import {
  deserializeDeck,
  serializeDeck,
  SerializedLanguageDeck,
} from './deckSerializer';

const languageDeck: LanguageDeck = {
  language: 'nl',
  settings: {},
  cards: [
    {
      id: 'c1',
      created: 1,
      updated: 1,
      data: {
        language: 'en',
        tags: [
          {
            id: 't1',
            created: 1,
            updated: 1,
            data: {
              title: 'Tag 1',
            },
          },
          {
            id: 't2',
            created: 1,
            updated: 1,
            data: {
              title: 'Tag 2',
            },
          },
        ],
        source: 'iets',
        partOfSpeech: 'adjective',
        definition: '',
        translation: 'something',
        dueDate: 1,
        eFactor: 0,
        interval: 0,
        repetition: 1,
      },
    },
  ],
  tags: [
    {
      id: 't1',
      created: 1,
      updated: 1,
      data: {
        title: 'Tag 1',
      },
    },
    {
      id: 't2',
      created: 1,
      updated: 1,
      data: {
        title: 'Tag 2',
      },
    },
  ],
};

const serializedLanguageDeck: SerializedLanguageDeck = {
  language: 'nl',
  settings: {},
  cards: [
    {
      id: 'c1',
      created: 1,
      updated: 1,
      data: {
        language: 'en',
        tagIds: ['t1', 't2'],
        source: 'iets',
        partOfSpeech: 'adjective',
        definition: '',
        translation: 'something',
        dueDate: 1,
        eFactor: 0,
        interval: 0,
        repetition: 1,
      },
    },
  ],
  tags: [
    {
      id: 't1',
      created: 1,
      updated: 1,
      data: {
        title: 'Tag 1',
      },
    },
    {
      id: 't2',
      created: 1,
      updated: 1,
      data: {
        title: 'Tag 2',
      },
    },
  ],
};

describe('deckSerializer', () => {
  describe('serializeDeck', () => {
    it('works', () => {
      const result = serializeDeck(languageDeck);
      expect(result).toEqual(serializedLanguageDeck);
    });
  });

  describe('deserializeDeck', () => {
    it('works', () => {
      const result = deserializeDeck(serializedLanguageDeck);
      expect(result).toEqual(languageDeck);
    });
  });
});
