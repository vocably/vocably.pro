import { CardItem } from '@vocably/model';
import { createSrsItem } from '@vocably/srs';
import { combineCards, getCardCandidates } from './createTranslationCards';

describe('createCards', () => {
  describe('addCardCandidates', () => {
    it('properly adds candidates when no such words exist in dictionary', () => {
      const collection: CardItem[] = [];
      const cardItems = getCardCandidates(collection, [
        {
          language: 'en',
          source: 'do',
          definition: 'делать',
          translation: '',
          partOfSpeech: '',
          tags: [],
          ...createSrsItem(),
        },
        {
          language: 'en',
          source: 'swim',
          definition: 'плавать',
          translation: '',
          partOfSpeech: '',
          tags: [],
          ...createSrsItem(),
        },
      ]);

      expect(cardItems[0].data.source).toEqual('do');
      expect(cardItems[1].data.source).toEqual('swim');
      // @ts-ignore
      expect(cardItems[0].id).toEqual(undefined);
      // @ts-ignore
      expect(cardItems[1].id).toEqual(undefined);
    });

    it('properly returns an existing item if such a candidate already exists', () => {
      const collection: CardItem[] = [
        {
          id: '123',
          created: 123,
          data: {
            language: 'en',
            source: 'do',
            definition: 'делать',
            translation: '',
            partOfSpeech: '',
            tags: [
              {
                id: 'tag1',
                data: {
                  title: 'Tag 1',
                },
                created: 123,
                updated: 123,
              },
            ],
            ...createSrsItem(),
          },
        },
        {
          id: '456',
          created: 456,
          data: {
            language: 'en',
            source: 'swim',
            definition: 'плавать',
            translation: '',
            partOfSpeech: '',
            tags: [],
            ...createSrsItem(),
          },
        },
      ];

      const doItem = collection[0];
      const cardItems = getCardCandidates(collection, [
        {
          language: 'en',
          source: 'fight',
          definition: 'бороться',
          translation: '',
          partOfSpeech: '',
          tags: [],
          ...createSrsItem(),
        },
        {
          language: 'en',
          source: 'do',
          definition: 'делать',
          translation: '',
          partOfSpeech: '',
          tags: [],
          ...createSrsItem(),
        },
      ]);

      expect(cardItems[0].data.source).toEqual('fight');
      // @ts-ignore
      expect(cardItems[1].id).toEqual(doItem.id);
      expect(cardItems[1].data.tags).toEqual(doItem.data.tags);
    });

    it('considers parts of speech when adding card candidates', () => {
      const collection: CardItem[] = [
        {
          id: '123',
          created: 123,
          data: {
            language: 'nl',
            source: 'naar',
            definition: 'onprettig, onaangenaam',
            partOfSpeech: 'adjective',
            translation: '',
            tags: [
              {
                id: 'tag1',
                data: {
                  title: 'Tag 1',
                },
                created: 123,
                updated: 123,
              },
            ],
            ...createSrsItem(),
          },
        },
        {
          id: '456',
          created: 456,
          data: {
            language: 'nl',
            source: 'naar',
            definition: 'in de richting van',
            partOfSpeech: 'preposition',
            translation: '',
            tags: [
              {
                id: 'tag1',
                data: {
                  title: 'Tag 1',
                },
                created: 123,
                updated: 123,
              },
            ],
            ...createSrsItem(),
          },
        },
      ];

      const cardItems = getCardCandidates(collection, [
        {
          language: 'nl',
          source: 'naar',
          definition: 'zoals',
          partOfSpeech: 'conjunction',
          translation: '',
          tags: [],
          ...createSrsItem(),
        },
      ]);

      expect(cardItems[0].data.partOfSpeech).toEqual('conjunction');
    });
  });

  describe('combineCards', () => {
    it('works as expected with the collections of cards', () => {
      const existingItems = [
        {
          language: 'nl',
          source: 'aanwezig',
          partOfSpeech: 'adjective',
          definition: 'als je er bij bent',
          translation: 'present',
          tags: [
            {
              id: 'tag1',
              data: {
                title: 'Tag 1',
              },
              created: 123,
              updated: 123,
            },
          ],
          ...createSrsItem(),
        },
      ];

      const newItem = {
        language: 'nl',
        source: 'worden',
        partOfSpeech: 'verb',
        definition: `koppelwerkwoord dat aangeeft dat iets in een bepaalde toestand komt, begint te zijn of in de toekomst zal zijn`,
        translation: 'become',
        tags: [],
        ...createSrsItem(),
      };

      expect(combineCards(existingItems, newItem)).toEqual([
        ...existingItems,
        newItem,
      ]);
    });

    it('adds up the definition', () => {
      const existingItems = [
        {
          language: 'nl',
          source: 'inzetten',
          partOfSpeech: 'verb',
          definition: 'moeite doen (voor iets of iemand)',
          translation: 'to stake',
          tags: [
            {
              id: 'tag1',
              data: {
                title: 'Tag 1',
              },
              created: 123,
              updated: 123,
            },
          ],
          ...createSrsItem(),
        },
        {
          language: 'nl',
          source: 'aanwezig',
          partOfSpeech: 'adjective',
          definition: 'als je er bij bent',
          translation: 'present',
          tags: [
            {
              id: 'tag1',
              data: {
                title: 'Tag 1',
              },
              created: 123,
              updated: 123,
            },
          ],
          ...createSrsItem(),
        },
      ];

      const newItem = {
        language: 'nl',
        source: 'inzetten',
        partOfSpeech: 'verb',
        definition: `* iets ergens in plaatsen
* (iemand) inschakelen (bij iets)`,
        translation: 'become',
        tags: [],
        ...createSrsItem(),
      };

      expect(combineCards(existingItems, newItem)).toEqual([
        {
          ...existingItems[0],
          definition: `* moeite doen (voor iets of iemand)
* iets ergens in plaatsen
* (iemand) inschakelen (bij iets)`,
        },
        existingItems[1],
      ]);
    });
  });
});
