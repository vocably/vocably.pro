import { isItem } from '@vocably/crud';
import {
  CardItem,
  GoogleLanguage,
  isCardItem,
  isDetachedCardItem,
  Result,
  TagItem,
  TranslationCards,
} from '@vocably/model';
import { cloneDeep, isEqual } from 'lodash-es';
import { registerContentScript } from '../src';
import { configureContentScript } from '../src/configuration';
import { nanoid } from 'nanoid';
import { updateDetachedCard } from '@vocably/model-operations';

let isUserKnowsHowToAdd = false;

let tags: TagItem[] = [
  {
    id: '1',
    created: 123,
    data: {
      title: 'Lesson 1',
    },
  },
  {
    id: '2',
    created: 234,
    data: {
      title: 'Lesson 2',
    },
  },
];

registerContentScript({
  api: {
    appBaseUrl: 'http://localhost:8030',
    isLoggedIn: () =>
      Promise.resolve(
        (document.getElementById('isLoggedIn') as HTMLInputElement).checked
      ),
    getInternalProxyLanguage: () =>
      Promise.resolve(
        (document.getElementById('hasProxyLanguage') as HTMLInputElement)
          .checked
          ? ('en' as const)
          : null
      ),
    setInternalProxyLanguage: async () => {
      // @ts-ignore
      document.getElementById('hasProxyLanguage').checked = true;
    },
    getInternalSourceLanguage: () =>
      Promise.resolve(
        (document.getElementById('hasProxyLanguage') as HTMLInputElement)
          .checked
          ? ('nl' as const)
          : null
      ),
    setInternalSourceLanguage: async () => {
      // @ts-ignore
      document.getElementById('hasProxyLanguage').checked = true;
    },
    isActive: () =>
      Promise.resolve(
        (document.getElementById('isActive') as HTMLInputElement).checked
      ),
    isEligibleForTrial: () =>
      Promise.resolve(
        (document.getElementById('isEligibleForTrial') as HTMLInputElement)
          .checked
      ),
    analyze: (payload) => {
      console.info('Analyze request', payload);
      return new Promise((resolve) => {
        setTimeout(
          () => {
            const result = JSON.parse(
              (document.getElementById('response') as HTMLTextAreaElement).value
            );

            if (result.success === false) {
              resolve(result);
              return;
            }
            result.value.deck.tags = tags;
            resolve(result);
          },
          parseInt((document.getElementById('delay') as HTMLInputElement).value)
        );
      });
    },
    explain: (payload) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            value: {
              sourceLanguage: payload.sourceLanguage,
              targetLanguage: payload.targetLanguage,
              explanation:
                'Для правильного понимания этого предложения обратите внимание на следующие моменты:\n' +
                '\n' +
                '1. **Грамматическая структура**: \n' +
                '   - "Alice was beginning" - это конструкция в прошедшем продолженном времени (Past Continuous), указывающая на действие, которое началось в прошлом и продолжалось в тот момент.\n' +
                '   - "to get very tired" - инфинитивная конструкция, указывающая на процесс становления уставшей.\n' +
                '\n' +
                '2. **Смысловые акценты**:\n' +
                '   - "beginning to get" - подчеркивает начало процесса усталости, а не его завершение.\n' +
                '   - "very tired" - усиливает степень усталости, показывая, что это не просто легкая усталость.\n' +
                '\n' +
                '3. **Контекст**:\n' +
                '   - "of sitting" - указывает причину усталости, то есть усталость вызвана длительным сидением.\n' +
                '\n' +
                'Понимание этих аспектов поможет правильно интерпретировать предложение.',
              unitsOfSpeech: [
                {
                  headword: 'something',
                  partOfSpeech: 'noun',
                },
              ],
            },
          });
        }, 4000);
      });
    },
    addCard: (payload) =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            value: {
              ...payload.translationCards,
              deck: {
                ...payload.translationCards.deck,
                cards: [
                  ...payload.translationCards.deck.cards,
                  {
                    id: nanoid(5),
                    created: new Date().getTime(),
                    data: {
                      ...payload.card.data,
                      interval: 0,
                      repetition: 0,
                      eFactor: 2.5,
                      dueDate: 0,
                    },
                  },
                ],
              },
            },
          });
        }, 500);
      }),
    getUserEmail: () =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            value: 'dmytro@sneas.io',
          });
        }, 500);
      }),
    removeCard: (payload) =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            value: {
              ...payload.translationCards,
              deck: {
                ...payload.translationCards.deck,
                cards: payload.translationCards.deck.cards.filter(
                  (card) => card.id !== payload.card.id
                ),
              },
            },
          });
        }, 500);
      }),
    ping: () => Promise.resolve('pong'),
    listLanguages: () =>
      Promise.resolve({
        success: true,
        value: ['en', 'nl'] as const,
      }),
    listTargetLanguages: () => Promise.resolve(['en', 'ru']),
    isUserKnowsHowToAdd: () => Promise.resolve(isUserKnowsHowToAdd),
    setUserKnowsHowToAdd: async (value) => {
      isUserKnowsHowToAdd = value;
    },
    getAudioPronunciation: (payload) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            value: {
              url: `https://ssl.gstatic.com/dictionary/static/sounds/20200429/hello--_gb_1.mp3`,
            },
          });
        }, 50);
      });
    },
    canPlayOffScreen: async () => {
      return false;
    },
    playAudioPronunciation: async () => {
      return {
        success: true,
        value: true,
      };
    },
    askForRating: () => {
      const askForRating = document.getElementById(
        'askForRating'
      ) as HTMLInputElement;
      return new Promise((resolve) => {
        if (askForRating.checked === false) {
          resolve(false);
          return;
        }

        setTimeout(() => resolve(true), 1000);
      });
    },
    saveAskForRatingResponse: () => Promise.resolve(undefined),
    getLocationLanguage: () => Promise.resolve(null),
    saveLocationLanguage: () => Promise.resolve(undefined),
    getSettings: () =>
      new Promise((resolve) => {
        resolve({
          showOnDoubleClick: (
            document.getElementById('showOnDoubleClick') as HTMLInputElement
          ).checked,

          showOnSelection: (
            document.getElementById('showOnSelection') as HTMLInputElement
          ).checked,

          autoPlay: (document.getElementById('playSound') as HTMLInputElement)
            .checked,

          hideSelectionButton: (
            document.getElementById('hideSelectionButton') as HTMLInputElement
          ).checked,

          showOnHotKey: (
            document.getElementById('showOnHotKey') as HTMLInputElement
          ).checked,

          autodetectLanguage: false,
          locale: 'en',
        });
      }),

    updateCard: (payload) => {
      return new Promise((resolve) => {
        const translationCards = cloneDeep(payload.translationCards);

        if (isDetachedCardItem(payload.card)) {
          resolve(
            updateDetachedCard({
              card: payload.card,
              data: payload.data,
              translationCards: payload.translationCards,
            })
          );
          return;
        }

        translationCards.deck.cards = translationCards.deck.cards.map(
          (existingCard) => {
            if (
              !isCardItem(payload.card) ||
              existingCard.id !== payload.card.id
            ) {
              return existingCard;
            }

            return {
              ...payload.card,
              data: {
                ...payload.card.data,
                ...payload.data,
              },
            } as CardItem;
          }
        );

        setTimeout(() => {
          resolve({
            success: true,
            value: translationCards,
          });
        }, 1000);
      });
    },

    attachTag: (payload) =>
      new Promise((resolve) => {
        const translationCards = cloneDeep(payload.translationCards);
        setTimeout(() => {
          let tag: TagItem;
          if (isItem(payload.tag)) {
            tag = payload.tag;
          } else {
            tag = {
              id: Math.random().toString(),
              data: payload.tag.data,
              created: +new Date(),
            };

            tags = [...tags, tag];
            translationCards.deck.tags = tags;
          }

          translationCards.deck.cards = translationCards.deck.cards.map(
            (translationCard) => {
              return {
                ...translationCard,
                data: {
                  ...translationCard.data,
                  tags: translationCard.data.tags.map((cardTag) =>
                    cardTag.id === tag.id ? tag : cardTag
                  ),
                },
              };
            }
          );

          const card = translationCards.deck.cards.find(
            (candidate) => isItem(candidate) && candidate.id == payload.cardId
          );

          if (card) {
            card.data.tags.push(tag);
          }

          return resolve({
            success: true,
            value: translationCards,
          });
        }, 1000);
      }),
    detachTag: (payload) =>
      new Promise((resolve) => {
        const translationCards = cloneDeep(payload.translationCards);
        setTimeout(() => {
          const card = translationCards.deck.cards.find(
            (translationCard) =>
              isItem(translationCard) && translationCard.id === payload.cardId
          );

          if (card) {
            card.data.tags = card.data.tags.filter(
              (cardTag) => cardTag.id !== payload.tag.id
            );
          }

          resolve({
            success: true,
            value: translationCards,
          });
        }, 1000);
      }),
    updateTag: (payload) =>
      new Promise((resolve) =>
        setTimeout(() => {
          const translationCards = cloneDeep(payload.translationCards);
          tags = tags.map((tag) =>
            tag.id !== payload.tag.id ? tag : payload.tag
          );
          translationCards.deck.tags = tags;
          translationCards.deck.cards.forEach((card) => {
            card.data.tags = card.data.tags.map((cardTag) =>
              cardTag.id !== payload.tag.id ? cardTag : payload.tag
            );
          });

          resolve({
            success: true,
            value: translationCards,
          });
        }, 1000)
      ),
    deleteTag: (payload) =>
      new Promise((resolve) =>
        setTimeout(() => {
          const translationCards = cloneDeep(payload.translationCards);
          tags = tags.filter((t) => t.id !== payload.tag.id);
          translationCards.deck.tags = tags;

          translationCards.deck.cards.forEach((card) => {
            card.data.tags = card.data.tags.filter(
              (cardTag) => cardTag.id !== payload.tag.id
            );
          });

          resolve({
            success: true,
            value: translationCards,
          });
        }, 1000)
      ),
    getCardsLimit: () => {
      return new Promise((resolve) =>
        setTimeout(() => {
          resolve(
            (document.getElementById('limitCards') as HTMLInputElement).checked
              ? {
                  maxCards: 50,
                  cardsPerDay: 1,
                }
              : 'unlimited'
          );
        }, 200)
      );
    },
    analyzeUnitsOfSpeech: () => {
      return new Promise((resolve) =>
        setTimeout(() => {
          resolve({
            success: true,
            value: {
              items: [
                {
                  source: 'blijven',
                  translation: 'stay, remain, last',
                  definitions: [
                    'Niet weggaan, op dezelfde plaats of in dezelfde toestand blijven.',
                    'Voortduren, aanhouden.',
                    'Overblijven, resteren.',
                  ],
                  examples: [
                    'Ik blijf thuis.',
                    'Het weer blijft slecht.',
                    'Er blijft weinig tijd over.',
                  ],
                  partOfSpeech: 'verb',
                  ipa: 'ˈblɛivə(n)',
                  number: 'plural',
                  pastTenses: 'bleef, is gebleven',
                  tense: 'present',
                },
                {
                  source: 'uiteindelijk',
                  translation: 'eventually, ultimately, in the end',
                  definitions: ['ten slotte', 'na alles', 'op het einde'],
                  examples: [
                    'Uiteindelijk besloot hij te blijven.',
                    'Het project was uiteindelijk een succes.',
                    'Ze kwamen uiteindelijk tot een akkoord.',
                  ],
                  partOfSpeech: 'adverb',
                  ipa: 'œy̯tˈɛin̯dələk',
                  number: 'singular',
                },
              ],
              failed: [],
            },
          });
        }, 200)
      );
    },
  },
  youTube: {
    ytHosts: ['localhost:8020'],
  },
  contentScript: {
    askForRatingEnabled: true,
    displayMobileLookupButton: false,
    allowFirstTranslationCongratulation: true,
    webPaymentLink: 'http://localhost:8030/subscribe',
  },
}).then();

// @ts-ignore
document
  // @ts-ignore
  .getElementById('showMobileButton')
  // @ts-ignore
  .addEventListener('change', (event) => {
    configureContentScript({
      // @ts-ignore
      displayMobileLookupButton: event.target.checked,
    });
  });

(window as any).putCaptions = () => {
  const captionSegment = document.querySelector('.ytp-caption-segment');

  if (captionSegment) {
    captionSegment.innerHTML = `These orbits, these arcs\n...something`;
  }
};

const successfulResponse: Result<TranslationCards> = {
  success: true,
  value: {
    explanation: 'Test explanation',
    detectedInputType: 'sentence',
    isDirect: true,
    source: 'gemaakt',
    sourceLanguage: 'nl',
    targetLanguage: 'en',
    deck: {
      language: 'nl',
      cards: [
        {
          id: 'Oqewl',
          created: 1646242718636,
          data: {
            language: 'nl',
            source: 'maken',
            g: 'f',
            ipa: 'ˈmaːkə(n)',
            example: '* winst maken\n* De klok is weer gemaakt.',
            definition:
              '(iets dat nog niet bestond) laten ontstaan\n(iets dat kapot is) zorgen dat het weer heel is',
            translation: 'to make',
            partOfSpeech: 'verb',
            interval: 0,
            repetition: 0,
            eFactor: 2.5,
            dueDate: 1646179200000,
            tags: [],
          },
        },
      ],
      tags: [],
    },
    items: [
      {
        source: 'gemaakt',
        g: 'f',
        ipa: 'ɣəˈmaːkt',
        examples: ['Bij een gemaakte glimlach lachen onze ogen niet mee.'],
        definitions: ['als iets niet natuurlijk is of gebeurt'],
        translation: 'made',
        partOfSpeech: 'adjective',
      },
      {
        source: 'maken',
        g: 'f',
        ipa: 'ˈmaːkə(n)',
        examples: ['winst maken', 'De klok is weer gemaakt.'],
        definitions: [
          '(iets dat nog niet bestond) laten ontstaan',
          '(iets dat kapot is) zorgen dat het weer heel is',
        ],
        translation: 'to make',
        partOfSpeech: 'verb',
      },
    ],
  },
};

const errorResponse: Result<TranslationCards> = {
  success: false,
  errorCode: 'CARDS_SAVE_HTTP_FETCH_ERROR',
  reason: 'Unable to fetch cards',
  extra: { a: 'b' },
};

window.addEventListener('load', () => {
  const responseTextarea = document.getElementById(
    'response'
  ) as HTMLTextAreaElement;

  const setSuccessfulResponse = document.getElementById(
    'setSuccessfulResponse'
  );

  const setErrorResponse = document.getElementById('setErrorResponse');

  if (!responseTextarea || !setSuccessfulResponse || !setErrorResponse) {
    return;
  }

  responseTextarea.value = JSON.stringify(successfulResponse, null, 2);

  setSuccessfulResponse.addEventListener('click', () => {
    responseTextarea.value = JSON.stringify(successfulResponse, null, 2);
  });

  setErrorResponse.addEventListener('click', () => {
    responseTextarea.value = JSON.stringify(errorResponse, null, 2);
  });
});
