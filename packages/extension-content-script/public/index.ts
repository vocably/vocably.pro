import { isItem } from '@vocably/crud';
import { TagItem } from '@vocably/model';
import { cloneDeep, isEqual } from 'lodash-es';
import { registerContentScript } from '../src';
import { configureContentScript } from '../src/configuration';

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
          ? 'en'
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
          ? 'nl'
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

            if (payload.sourceLanguage) {
              result.value.translation.sourceLanguage = payload.sourceLanguage;
            }

            // @ts-ignore
            result.value.translation.source = payload.source;

            result.value.tags = tags;
            result.value.addedToday = 3;

            resolve(result);
          },
          parseInt((document.getElementById('delay') as HTMLInputElement).value)
        );
      });
    },
    explain: (payload) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          if (payload.source.split(' ').length === 1) {
            resolve({
              success: true,
              value: {
                sourceLanguage: payload.sourceLanguage,
                targetLanguage: payload.targetLanguage,
                explanation: '',
                unitsOfSpeech: [],
              },
            });
          }

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
              unitsOfSpeech: [],
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
              cards: payload.translationCards.cards.map((card) => {
                return isEqual(card, payload.card)
                  ? {
                      id: 'new-id',
                      created: new Date().getTime(),
                      ...payload.card,
                    }
                  : card;
              }),
              collectionLength: payload.translationCards.collectionLength + 1,
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
              cards: payload.translationCards.cards.map((card) => {
                return isEqual(card, payload.card)
                  ? {
                      data: payload.card.data,
                    }
                  : card;
              }),
              collectionLength: payload.translationCards.collectionLength - 1,
            },
          });
        }, 500);
      }),
    cleanUp: () => Promise.resolve({ success: true, value: null }),
    ping: () => Promise.resolve('pong'),
    listLanguages: () =>
      Promise.resolve({ success: true, value: ['en', 'nl'] }),
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

        translationCards.cards = translationCards.cards.map((existingCard) => {
          if (!isEqual(existingCard, payload.card)) {
            return existingCard;
          }

          return {
            ...payload.card,
            data: {
              ...payload.card.data,
              ...payload.data,
            },
          };
        });

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
            translationCards.tags = tags;
          }

          translationCards.cards = translationCards.cards.map(
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

          const card = translationCards.cards.find(
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
          const card = translationCards.cards.find(
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
          translationCards.tags = tags;
          translationCards.cards.forEach((card) => {
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
          translationCards.tags = tags;

          translationCards.cards.forEach((card) => {
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
