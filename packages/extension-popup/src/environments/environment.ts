import {
  addCard,
  analyze,
  askForRating,
  attachTag,
  deleteTag,
  detachTag,
  explain,
  ExtensionSettings,
  getAudioPronunciation,
  getInternalSourceLanguage,
  getLanguagePairs,
  getCardsLimit,
  getSettings,
  isLoggedIn,
  removeCard,
  saveAskForRatingResponse,
  setSettings,
  updateCard,
  updateTag,
} from '@vocably/extension-messages';
import { isEqual, merge } from 'lodash-es';
import { environmentLocal } from './environmentLocal';
import { detectLocale } from '@vocably/browser-i18n';

let settings: ExtensionSettings = {
  showOnDoubleClick: true,
  autoPlay: true,
  hideSelectionButton: true,
  autodetectLanguage: false,
  showOnHotKey: false,
  locale: detectLocale(),
};

const timeout = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const mockGetSettings: typeof getSettings = async () => {
  return settings;
};

const mockSetSettings: typeof setSettings = async (newSettings) => {
  settings = merge(settings, newSettings);
  return settings;
};

const mockIsLoggedIn: typeof isLoggedIn = async () => {
  await timeout(500);
  const params = new URLSearchParams(window.location.search);
  return !params.has('notLoggedIn');
};

// @ts-ignore
const mockGetInternalSourceLanguage: typeof getInternalSourceLanguage =
  async () => {
    await timeout(500);
    const params = new URLSearchParams(window.location.search);
    return params.has('noInternalSourceLanguage') ? null : 'en';
  };

const mockAnalyze: typeof analyze = async () => {
  await timeout(200);

  return {
    success: true,
    value: {
      cards: [
        {
          data: {
            language: 'nl',
            source: 'gemaakt',
            g: 'f',
            ipa: 'ɣəˈmaːkt',
            example: 'Bij een gemaakte glimlach lachen onze ogen niet mee.',
            definition: 'als iets niet natuurlijk is of gebeurt',
            translation: 'made',
            partOfSpeech: 'adjective',
            interval: 0,
            repetition: 0,
            eFactor: 2.5,
            dueDate: 1646179200000,
            tags: [],
          },
        },
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
              '* (iets dat nog niet bestond) laten ontstaan\n* (iets dat kapot is) zorgen dat het weer heel is',
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
      source: 'gemaakt',
      sourceLanguage: 'nl',
      targetLanguage: 'en',
      aiThinksItIs: 'made',
      detectedInputType: 'word',
      tags: [],
      explanation: 'Explanation example',
      collectionLength: 49,
      addedToday: 4,
    },
  };
};

const mockExplain: typeof explain = async (payload) => {
  await timeout(3000);
  return {
    success: true,
    value: {
      sourceLanguage: payload.sourceLanguage,
      targetLanguage: payload.targetLanguage,
      unitsOfSpeech: [],
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
    },
  };
};

const mockAddCard: typeof addCard = async (payload) => {
  await timeout(500);

  return {
    success: true,
    value: {
      ...payload.translationCards,
      cards: payload.translationCards.cards.map((translationCard) => {
        if (translationCard.data.source !== payload.card.data.source) {
          return translationCard;
        }

        return {
          id: 'piu',
          created: 123,
          updated: 123,
          data: translationCard.data,
        };
      }),
      collectionLength: payload.translationCards.collectionLength + 1,
    },
  };
};

const mockRemoveCard: typeof removeCard = async (payload) => {
  await timeout(2000);

  return {
    success: true,
    value: {
      ...payload.translationCards,
      cards: payload.translationCards.cards.map((translationCard) => {
        if (translationCard.data.source !== payload.card.data.source) {
          return translationCard;
        }

        return {
          data: translationCard.data,
        };
      }),
      collectionLength: payload.translationCards.collectionLength - 1,
    },
  };
};

const mockAttachTag: typeof attachTag = async (payload) => {
  console.log(
    'Attach tag. This mock action does nothing. Do not expect any result.',
    payload
  );
  await timeout(2000);
  return {
    success: true,
    value: payload.translationCards,
  };
};
const mockDetachTag: typeof detachTag = async (payload) => {
  console.log(
    'Detach tag. This mock action does nothing. Do not expect any result.',
    payload
  );
  await timeout(2000);
  return {
    success: true,
    value: payload.translationCards,
  };
};
const mockDeleteTag: typeof deleteTag = async (payload) => {
  console.log(
    'Delete tag. This mock action does nothing. Do not expect any result.',
    payload
  );
  await timeout(2000);
  return {
    success: true,
    value: payload.translationCards,
  };
};
const mockUpdateTag: typeof updateTag = async (payload) => {
  console.log(
    'Update tag. This mock action does nothing. Do not expect any result.',
    payload
  );
  await timeout(2000);
  return {
    success: true,
    value: payload.translationCards,
  };
};

const mockGetAudioPronunciation: typeof getAudioPronunciation = async () => {
  await timeout(2000);
  return {
    success: false,
    errorCode: 'UNABLE_TO_PLAY_AUDIO_DATA_URL',
    reason: 'This is just a mock error',
  };
};

const mockGetLanguagePairs: typeof getLanguagePairs = async () => {
  await timeout(500);

  const params = new URLSearchParams(window.location.search);
  if (params.has('noLanguagePairs')) {
    return {};
  }

  return {
    nl: {
      currentTargetLanguage: 'en',
      possibleTargetLanguages: ['en', 'ru'],
    },
    en: {
      currentTargetLanguage: 'ru',
      possibleTargetLanguages: ['ru', 'uk'],
    },
  };
};

const mockUpdateCard: typeof updateCard = async (payload) => {
  await timeout(500);

  return {
    success: true,
    value: {
      ...payload.translationCards,
      cards: payload.translationCards.cards.map((existingCard) => {
        if (isEqual(existingCard, payload.card)) {
          return {
            ...existingCard,
            data: {
              ...existingCard.data,
              ...payload.data,
            },
          };
        }

        return existingCard;
      }),
    },
  };
};

const askForRatingMock: typeof askForRating = async (payload) => {
  await timeout(500);

  return true;
};

const saveAskForRatingResponseMock: typeof saveAskForRatingResponse = async (
  payload
) => {
  await timeout(500);
};

const getCardsLimitMock: typeof getCardsLimit = async () => {
  await timeout(500);
  return {
    maxCards: 50,
    cardsPerDay: 1,
  };
};

export const environment = merge(environmentLocal, {
  production: false,
  analyze: mockAnalyze,
  explain: mockExplain,
  addCard: mockAddCard,
  removeCard: mockRemoveCard,
  attachTag: mockAttachTag,
  detachTag: mockDetachTag,
  deleteTag: mockDeleteTag,
  updateTag: mockUpdateTag,
  getSettings: mockGetSettings,
  setSettings: mockSetSettings,
  isLoggedIn: mockIsLoggedIn,
  getInternalSourceLanguage: mockGetInternalSourceLanguage,
  getAudioPronunciation: mockGetAudioPronunciation,
  getLanguagePairs: mockGetLanguagePairs,
  updateCard: mockUpdateCard,
  askForRating: askForRatingMock,
  saveAskForRatingResponse: saveAskForRatingResponseMock,
  getCardsLimit: getCardsLimitMock,
});
