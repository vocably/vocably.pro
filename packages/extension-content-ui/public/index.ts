import { defineCustomElements } from '@vocably/extension-content-ui/loader';

import { Result, TagItem, TranslationCards } from '@vocably/model';

export { Components, JSX } from '../src/components';

defineCustomElements();

document.querySelectorAll('h1').forEach((h1) => {
  if (!h1 || !h1.textContent) {
    return;
  }

  const text = h1.textContent.trim();
  const id = text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
  if (!h1.id) h1.id = id || 'h1-' + Math.random().toString(36).slice(2);
  const link = document.createElement('a');
  link.href = '#' + h1.id;
  link.textContent = text;
  h1.textContent = '';
  h1.appendChild(link);

  const observer = new MutationObserver(() => {
    requestAnimationFrame(() => {
      if (window.location.hash !== '#' + h1.id) return;
      h1.scrollIntoView({ block: 'start' });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
});

const simpletonTranslationResult: Result<TranslationCards> = {
  success: true,
  value: {
    explanation: '',
    source: 'gemaakt',
    sourceLanguage: 'nl',
    targetLanguage: 'en',
    detectedInputType: 'word',
    aiThinksItIs: 'created',
    deck: {
      language: 'nl',
      cards: [
        {
          id: 'simpleton1',
          created: 1639827779683,
          data: {
            language: 'nl',
            source: 'gemaakt',
            ipa: "xə'mak",
            translation: 'created, done',
            definition:
              '(iets dat nog niet bestond) laten ontstaan\n(iets dat kapot is) zorgen dat het weer heel is',
            example: 'Bij een gemaakte glimlach lachen onze ogen niet mee.',
            partOfSpeech: 'verb',
            g: 'n',
            tense: 'present',
            presentTenses: 'maak, maakt',
            pastTenses: 'makte, gemaakt',
            tags: [],
            interval: 0,
            repetition: 0,
            eFactor: 2.5,
            dueDate: 0,
          },
        },
      ],
      tags: [],
    },
    items: [
      {
        source: 'gemaakt',
        ipa: "xə'mak",
        translation: 'created, done',
        definitions: [
          '(iets dat nog niet bestond) laten ontstaan',
          '(iets dat kapot is) zorgen dat het weer heel is',
        ],
        examples: ['Bij een gemaakte glimlach lachen onze ogen niet mee.'],
        partOfSpeech: 'verb',
        g: 'n',
        tense: 'present',
        presentTenses: 'maak, maakt',
        pastTenses: 'makte, gemaakt',
      },
    ],
  },
};

const longCard = JSON.parse(
  JSON.stringify(simpletonTranslationResult.value.deck.cards[0])
);

longCard.data.source =
  'Zo verdeeld als de reacties op zijn uitspraken waren tijdens\n' +
  '                zijn leven, zo uiteenlopend zijn ook de reacties op de\n' +
  '                gewelddadige dood van de Amerikaanse politiek activist en\n' +
  '                invloedrijk mediapersoonlijkheid Charlie Kirk. Naast de\n' +
  '                gebruikelijke oproepen tot kalmte, verdraagzaamheid en gebed,\n' +
  '                zijn er ook mensen die zich afvragen of Kirk het er niet naar\n' +
  '                gemaakt heeft. En er zijn aansporingen af te rekenen met zijn\n' +
  '                politieke vijanden, allemaal nog voordat er ook maar een dader\n' +
  '                is gearresteerd of een motief bekend is. ';

console.log(longCard);

// @ts-ignore
document.getElementById('congrats').card = longCard;

// @ts-ignore
document.getElementById('congrats-short').card =
  simpletonTranslationResult.value.deck.cards[0];

const successfulTranslationResult: Result<TranslationCards> = {
  success: true,
  value: {
    explanation: '',
    source: 'gemaakt',
    sourceLanguage: 'nl',
    targetLanguage: 'en',
    detectedInputType: 'word',
    aiThinksItIs: 'created',
    deck: {
      language: 'nl',
      cards: [
        {
          id: 'NYS4L',
          created: 1639827779683,
          data: {
            language: 'nl',
            source: 'maken',
            ipa: "'makə(n)",
            example:
              '* winst maken [make a profit]\n* De klok is weer gemaakt.',
            definition:
              '(iets dat nog niet bestond) laten ontstaan\n(iets dat kapot is) zorgen dat het weer heel is',
            translation: 'to make',
            partOfSpeech: 'verb',
            tense: 'present',
            presentTenses: 'maak, maakt, maken',
            pastTenses: 'maakte, heeft gemaakt',
            tags: [
              { id: '1', data: { title: 'Lesson 1' }, created: 123 },
              { id: '2', data: { title: 'Lesson 2' }, created: 234 },
            ],
            interval: 0,
            repetition: 0,
            eFactor: 2.5,
            dueDate: 0,
          },
        },
      ],
      tags: [
        { id: '1', data: { title: 'Lesson 1' }, created: 123 },
        { id: '2', data: { title: 'Lesson 2' }, created: 234 },
        { id: '3', data: { title: 'Lesson 3' }, created: 345 },
      ],
    },
    items: [
      {
        source: 'maken',
        ipa: "'makə(n)",
        translation: 'to make',
        definitions: [
          '(iets dat nog niet bestond) laten ontstaan',
          '(iets dat kapot is) zorgen dat het weer heel is',
        ],
        examples: [
          '* winst maken [make a profit]',
          '* De klok is weer gemaakt.',
        ],
        partOfSpeech: 'verb',
        tense: 'present',
        presentTenses: 'maak, maakt, maken',
        pastTenses: 'maakte, heeft gemaakt',
      },
      {
        source: 'gemaakt',
        ipa: "xə'mak",
        translation: 'created, done',
        definitions: [
          'als iets niet natuurlijk is of gebeurt [if something is not natural or does not happen]',
        ],
        examples: [
          "Bij een gemaakte glimlach lachen onze ogen niet mee. [When we fake a smile, our eyes don't smile along with us.]",
        ],
        partOfSpeech: 'adjective',
        tense: 'present',
      },
    ],
  },
};

const englishTranslationResult: Result<TranslationCards> = {
  success: true,
  value: {
    explanation: '',
    source: 'bringing',
    sourceLanguage: 'en',
    targetLanguage: 'en',
    detectedInputType: 'word',
    aiThinksItIs: 'bringing',
    deck: {
      language: 'en',
      cards: [
        {
          id: 'ifu0J',
          created: 1651656677053,
          data: {
            language: 'en',
            source: 'bring',
            example:
              '* Bring your swimsuit.\n* March usually brings rain.\n* We added another ten, bringing the number to 104.',
            definition:
              'to have something or somebody with you when you come\nto make sth come to a place\nto result in a new total of',
            translation: '',
            partOfSpeech: 'verb',
            tense: 'present',
            presentTenses: 'bring, brings',
            pastTenses: 'brought',
            interval: 0,
            repetition: 0,
            eFactor: 2.5,
            dueDate: 1651622400000,
            tags: [],
          },
        },
      ],
      tags: [],
    },
    items: [
      {
        source: 'bring',
        translation: '',
        definitions: [
          'to have something or somebody with you when you come',
          'to make sth come to a place',
          'to result in a new total of',
        ],
        examples: [
          '* Bring your swimsuit.',
          '* March usually brings rain.',
          '* We added another ten, bringing the number to 104.',
        ],
        partOfSpeech: 'verb',
        tense: 'present',
        presentTenses: 'bring, brings',
        pastTenses: 'brought',
      },
    ],
  },
};

const editTagForm = document.getElementById(
  'editTagForm'
) as HTMLVocablyTagFormElement;
editTagForm.tagItem = {
  id: '1',
  data: {
    title: 'Luke Skywalker',
  },
  created: 123,
};

// ----

const translationWithTagMenu = document.getElementById(
  'translationWithTagMenu'
) as HTMLVocablyTranslationElement;

translationWithTagMenu.result = successfulTranslationResult;

// ----

const extra: Result<TranslationCards> = {
  success: true,
  value: {
    explanation: '',
    source: 'gemaakt',
    sourceLanguage: 'nl',
    targetLanguage: 'en',
    detectedInputType: 'word',
    aiThinksItIs: 'created',
    deck: {
      language: 'nl',
      cards: [
        {
          id: 'NYS4L',
          created: 1639827779683,
          data: {
            language: 'nl',
            source: 'maken',
            ipa: "'makə(n)",
            example:
              '* winst maken [make a profit]\n* De klok is weer gemaakt.',
            definition:
              '(iets dat nog niet bestond) laten ontstaan\n(iets dat kapot is) zorgen dat het weer heel is',
            translation: 'to make',
            partOfSpeech: 'verb',
            tense: 'present',
            presentTenses: 'maak, maakt, maken',
            pastTenses: 'maakte, heeft gemaakt',
            tags: [
              { id: '1', data: { title: 'Lesson 1' }, created: 123 },
              { id: '2', data: { title: 'Lesson 2' }, created: 234 },
            ],
            interval: 0,
            repetition: 0,
            eFactor: 2.5,
            dueDate: 0,
          },
        },
      ],
      tags: [
        { id: '1', data: { title: 'Lesson 1' }, created: 123 },
        { id: '2', data: { title: 'Lesson 2' }, created: 234 },
        { id: '3', data: { title: 'Lesson 3' }, created: 345 },
      ],
    },
    items: [
      {
        source: 'maken',
        ipa: "'makə(n)",
        translation: 'to make',
        definitions: [
          '(iets dat nog niet bestond) laten ontstaan',
          '(iets dat kapot is) zorgen dat het weer heel is',
        ],
        examples: [
          '* winst maken [make a profit]',
          '* De klok is weer gemaakt.',
        ],
        partOfSpeech: 'verb',
        tense: 'present',
        pastTenses: 'maakte, heeft gemaakt',
      },
    ],
    extraItems: [
      {
        source: 'gemaakt',
        ipa: "xə'mak",
        translation: 'created, done',
        definitions: [
          'als iets niet natuurlijk is of gebeurt [if something is not natural or does not happen]',
        ],
        examples: [
          "Bij een gemaakte glimlach lachen onze ogen niet mee. [When we fake a smile, our eyes don't smile along with us.]",
        ],
        partOfSpeech: 'adjective',
        tense: 'present',
      },
    ],
  },
};

const translationWithExtraLoading = document.getElementById(
  'extra-loading'
) as HTMLVocablyTranslationElement;
translationWithExtraLoading.result = extra;
translationWithExtraLoading.isLoadingExtraWords = true;
translationWithExtraLoading.explanation = {
  state: 'loaded',
  value: 'Explanation goes here',
};

console.log(translationWithExtraLoading);

// ----

const menu = document.getElementById('menu') as HTMLVocablyTagsMenuElement;
menu.existingItems = [
  { id: '1', data: { title: 'Luke Skywalker' }, created: 123 },
  { id: '2', data: { title: 'Darth Vader' }, created: 123 },
  { id: '3', data: { title: 'Leia Organa' }, created: 123 },
  { id: '4', data: { title: 'Han Solo' }, created: 123 },
  { id: '5', data: { title: 'Yoda' }, created: 123 },
  { id: '6', data: { title: 'Obi-Wan Kenobi' }, created: 123 },
  { id: '7', data: { title: 'Palpatine' }, created: 123 },
  { id: '8', data: { title: 'Chewbacca' }, created: 123 },
  { id: '9', data: { title: 'Boba Fett' }, created: 123 },
  { id: '10', data: { title: 'Padmé Amidala' }, created: 123 },
  { id: '11', data: { title: 'Anakin Skywalker' }, created: 123 },
  { id: '12', data: { title: 'Mace Windu' }, created: 123 },
];
menu.selectedItems = ['2', '3', '4'];

menu.addEventListener('tagClick', (event) => {
  // @ts-ignore
  const tag = event.detail as TagItem;
  if (menu.selectedItems.includes(tag.id)) {
    menu.selectedItems = menu.selectedItems.filter(
      (itemId) => itemId !== tag.id
    );
  } else {
    menu.selectedItems = [tag.id, ...menu.selectedItems];
  }
});

// ----

const popup = document.getElementById('popup');
const closed = document.getElementById('closed');

popup &&
  popup.addEventListener('close', () => {
    closed && closed.classList.remove('d-none');
    setTimeout(() => {
      closed && closed.classList.add('d-none');
    }, 2000);
  });

// ---

const simpletonTranslation = document.getElementById(
  'simpletonTranslation'
) as HTMLVocablyTranslationElement;
simpletonTranslation.existingSourceLanguages = ['en', 'nl'];
simpletonTranslation.result = simpletonTranslationResult;
simpletonTranslation.canCongratulate = true;
simpletonTranslation.askForRating = true;
simpletonTranslation.explanation = { state: 'loading' };
simpletonTranslation.extensionPlatform = {
  name: 'Chrome Web Store',
  url: 'https://chrome.google.com/webstore/detail/vocably/baocigmmhhdemijfjnjdidbkfgpgogmb',
  platform: 'chromeExtension',
  paymentLink: 'web',
};

// ---

const paywallTranslation = document.getElementById(
  'paywallTranslation'
) as HTMLVocablyTranslationElement;
paywallTranslation.existingSourceLanguages = ['en', 'nl'];
paywallTranslation.result = simpletonTranslationResult;
paywallTranslation.canCongratulate = true;
paywallTranslation.askForRating = true;
paywallTranslation.explanation = { state: 'loading' };
paywallTranslation.extensionPlatform = {
  name: 'Chrome Web Store',
  url: 'https://chrome.google.com/webstore/detail/vocably/baocigmmhhdemijfjnjdidbkfgpgogmb',
  platform: 'chromeExtension',
  paymentLink: 'web',
};
paywallTranslation.paymentLink = 'https://app.vocably.pro/subscribe';
paywallTranslation.cardsLimit = {
  maxCards: 50,
  cardsPerDay: 1,
};

// ---

(
  document.getElementById(
    'translationEnglishSuccess'
  ) as HTMLVocablyTranslationElement
).result = englishTranslationResult;

// ----

const translationReload = document.getElementById(
  'translationReload'
) as HTMLVocablyTranslationElement;

translationReload.result = successfulTranslationResult;
translationReload.loading = true;

// ---

const translationError = document.getElementById(
  'translationError'
) as HTMLVocablyTranslationElement;

translationError.result = {
  success: false,
  errorCode: 'LANGUAGE_DECK_LOAD_ERROR',
  reason: 'Unable to fetch cards',
  extra: { a: 'b' },
};

// ----

const waitingCheckbox = document.getElementById(
  'languageWaiting'
) as HTMLInputElement;
const languageForm = document.getElementById(
  'languageForm'
) as HTMLVocablyLanguageElement;

waitingCheckbox.addEventListener('change', () => {
  languageForm.waiting = waitingCheckbox.checked;
});

// ---

const translationAskForRating = document.getElementById(
  'translationAskForRating'
) as HTMLVocablyTranslationElement;

translationAskForRating.result = successfulTranslationResult;
translationAskForRating.askForRating = true;
translationAskForRating.extensionPlatform = {
  name: 'Chrome Web Store',
  url: 'https://chrome.google.com/webstore/detail/vocably/baocigmmhhdemijfjnjdidbkfgpgogmb',
  platform: 'chromeExtension',
  paymentLink: 'web',
};

// ----

const translationSuccess = document.getElementById(
  'translationSuccess'
) as HTMLVocablyTranslationElement;
translationSuccess.existingSourceLanguages = ['en', 'nl'];
translationSuccess.result = successfulTranslationResult;
translationSuccess.canCongratulate = true;

// ----
