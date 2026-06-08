import { languageTranslations } from '@vocably/i18n';

const translations = {
  common: {
    cancel: 'Cancel',
    delete: 'Delete',
    save: 'Save',
    done: 'Done',
    close: 'Close',
    back: 'Back',
    ok: 'OK',
    yes: 'Yes',
    no: 'No',
    error: 'Error',
    goBack: 'Go back',
    operationFailed: 'Unable to perform the operation.',
    signIn: 'Sign in',
    presentTenses: '(present: {{value}})',
    pastTenses: '(past: {{value}})',
    plural: '(plural: {{value}})',
    examples: 'Examples',
  },
  appLanguagePicker: {
    title: 'App language',
  },
  nav: {
    myCards: 'My cards',
    lookUp: 'Look up',
    tips: 'Tips',
    settings: 'Settings',
    studySettings: 'Study settings',
    editCard: 'Edit card',
    chatWithCard: 'Chat about the card',
    cardGenerator: 'Card generator',
    feedback: 'Feedback',
    createAccount: 'Create an account',
    previewStudyStep: 'Preview study step',
    exportDeck: 'Export cards',
  },
  settings: {
    notRegistered: 'Not registered yet.',
    createAccount: 'Create an account',
    appLanguage: 'App language: {{label}}',
    studySettings: 'Study settings',
    studyReminders: {
      title: 'Study reminders',
      body: 'Study reminders are sent once a day to remind you to review your <bold>{{languageName}}</bold> cards.',
      perLanguageHint:
        'Every language has its own reminder settings available in the "Edit language" screen.',
      unregisteredHint:
        'Study reminders are not available for unregistered users.',
    },
    feedback: {
      title: 'Provide feedback',
      body: 'Are you missing any crucial feature or simply want to share your opinion about Vocably with me? I would love to hear from you.',
    },
    signOut: 'Sign out',
    deleteAccount: {
      menuItem: 'Delete my account',
      title: 'Delete your account?',
      message: 'This operation cannot be undone.',
    },
    deleteData: {
      menuItem: 'Delete my data',
      title: 'Delete your data?',
      message: 'This operation cannot be undone.',
    },
    version: 'Version: {{version}}',
  },
  feedback: {
    thanksTitle: 'Thank you for your feedback.',
    thanksFollowUp: 'I will follow up with you via email shortly.',
    sendFailed:
      'Something went wrong. Your feedback has not been sent. Please try again or contact me via email at d@vocably.pro.',
    noEmailTitle: 'No email',
    noEmailMessage:
      'Please include an email address right in the message so I can get back to you with an answer.',
    send: 'Send',
    intro: 'Have questions or feature requests? Reach out anytime.',
    personalReply:
      'I handle every inquiry personally and will get back to your email within a few days.',
    willReplyTo:
      "I'll reply to you at your email address <bold>{{email}}</bold>.",
    privateRelayNote:
      'It looks like you shared a private Apple email with me during registration, but no worries — it should work just fine.',
    provideEmail:
      'Please provide your email address so I can send a personal reply to your feedback.',
    yourMessage: 'Your message',
  },
  error: {
    clearData: {
      title: 'Clear the app data?',
      message:
        'Clearing app data will permanently delete all progress for unregistered users. Proceed?',
    },
    tryAgain: 'Try again',
    tryHarder: 'Try harder!',
    clearAndSignOut: 'Clear the app data and sign out',
  },
  howToGroupCards: {
    intro: 'Grouping can be done with tags.',
    swipeLeft:
      'Swipe any existing card left and press the <tagPlusIcon /> button.',
    tapOnNew: 'Or press the <tagPlusIcon /> button on a newly added card.',
    studyByTag:
      'When at least one tag is created, press the <tagIcon /> icon on the Study button to study a selected tag or a group of selected tags.',
    swipeToEdit:
      'Swipe any tag in the list to edit or delete it. Your cards will not be deleted.',
  },
  subscription: {
    loadingCustomerStatus: 'Loading customer status',
    goPremium: 'Go Premium',
  },
  premium: {
    label: 'Premium',
    nextPayment: 'Next payment: {{date}}',
    validUntil: 'Valid until: {{date}}',
    manageSubscription: 'Manage your subscription',
    refreshHint:
      'It takes a couple of minutes for your changes to reflect in the app.',
    refresh: 'Refresh',
  },
  paidAccount: {
    youArePremium: 'You are a Premium user',
    why: 'Why?',
    iDontKnow: "I don't know.",
    possibleReasons: 'Possible reasons:',
    reasonEarlyUser: 'You are one of the first active users of Vocably',
    reasonILikeYou: 'I like you',
    enjoyPremium: 'Anyway, enjoy your Premium.',
    wantToHelp: 'Want to help this app? <rate>Rate it on {{storeName}}</rate>.',
  },
  debug: {
    menuTitle: 'Debug Menu',
    languageTransformations: 'Language Transformations',
    studyStreak: 'Study Streak',
    clearStorage: 'Clear storage data',
  },
  studySettings: {
    maxCardsPerSession: 'Maximum cards per study session',
    maxNeverStudiedPerDay:
      'Maximum "never studied" cards that can be picked up per day',
    maxNeverStudiedHint:
      'This option only makes sense for experienced users who have a lot of new cards stacked in the "Never studied" group.',
    pronounceExample: 'Pronounce an example sentence',
    pronounceExampleHint:
      'This option makes the app play a random example sentence when appropriate during the study session. The <icon /> option should be turned on — it is in the top-right corner of the Study screen.',
    randomize: 'Randomly select cards to study',
    randomizeHint:
      '<warningIcon /> Enabling this option is generally a <bold>bad idea</bold>. This option disables the smart study algorithm. People who disable the smart study algorithm eventually get frustrated with their study progress.',
    srsLink:
      'Read how Vocably uses the smart study algorithm to help you learn more words in a shorter time.',
  },
  studyFlow: {
    mf: 'Choose the correct translation (multichoice question)',
    sf: 'Recall the correct translation',
    mb: 'Choose the correct word or phrase (multichoice question)',
    ab: 'Arrange the correct word or phrase by letters',
    sb: 'Recall the correct word or phrase',
    default: 'New step',
    preview: 'Preview',
    premiumOnly: 'Available to premium users',
    upgradeToPremium: 'Upgrade to Premium',
    heading: 'Study steps per card',
    rearrangeHintBefore: 'Use ',
    rearrangeHintAfter: ' to rearrange the steps.',
  },
  cardsLimit: {
    openVocablySettings: 'Open Vocably → Settings to upgrade.',
    upgradeToPremium: 'Upgrade to Premium',
    collectionHas_one:
      "Your collection has <bold>{{maxCards}}</bold> cards. You can now save <bold>{{count}} card per day.</bold> Premium users don't have this limit.",
    collectionHas_other:
      "Your collection has <bold>{{maxCards}}</bold> cards. You can now save <bold>{{count}} cards per day.</bold> Premium users don't have this limit.",
    collectionHasMoreThan_one:
      "Your collection has more than <bold>{{maxCards}}</bold> cards. You can now save <bold>{{count}} card per day.</bold> Premium users don't have this limit.",
    collectionHasMoreThan_other:
      "Your collection has more than <bold>{{maxCards}}</bold> cards. You can now save <bold>{{count}} cards per day.</bold> Premium users don't have this limit.",
  },
  chat: {
    thinking: 'Thinking...',
    errorOccurred: 'An error occurred. Please try again.',
    explain: 'Explain',
    examples: 'Examples',
    remember: 'Remember',
    explainMessage: 'Explain',
    examplesMessage: 'Provide several example sentences',
    rememberMessage: 'Help me remember this card',
    inputDisabled: 'This input is disabled now.',
    inputPlaceholder: 'Type your message here...',
    initialMessage:
      'You can ask anything about **{{source}}**, like:\n\n  * explain the meaning\n  * provide examples\n  * help to remember',
    initialMessageWithPartOfSpeech:
      'You can ask anything about the {{partOfSpeech}} **{{source}}**, like:\n\n  * explain the meaning\n  * provide examples\n  * help to remember',
  },
  dashboard: {
    loadingCards: 'Loading cards...',
    study: 'Study',
    studySection: 'Study',
    studySelectedTags: 'Study selected tags',
    tagsLabel: 'Tags:',
    cardsWithNoTags: 'Cards with no tags',
    cantWait: 'Study now',
    deleteCardFailedTitle: 'Error: Card deletion failed',
    deleteCardFailedMessage:
      'Oops! Something went wrong while attempting to delete the card. Please try again later.',
    searchPlaceholder: 'Search in your collection...',
    section: {
      today: 'Planned for today',
      expired: 'To catch up',
      notStarted: 'Never studied',
      tomorrow: 'Tomorrow',
      future: 'Planned',
    },
    empty: {
      noCardsYet: 'You have no study cards yet.',
      headOverToLookUp:
        'Head over to the Look Up tab to find and add some new words. Vocably is a dictionary with a built-in learning system.',
      headOverToGenerator:
        'Or use the card generator to create some study cards.',
      goToLookUp: 'Go to Look up',
      goToGenerator: 'Use card generator',
      noCardsForSearch: 'No cards found for <bold>{{searchText}}</bold>.',
      noCardsForTag:
        "You don't have any cards tagged with <bold>{{tagTitle}}</bold>.",
      noCardsForTags: 'No cards found for the selected tags.',
    },
    mayBeStudiedIn_one: 'May be studied in {{count}} minute.',
    mayBeStudiedIn_other: 'May be studied in {{count}} minutes.',
    dueDate: {
      tomorrow: 'tomorrow',
      inDays_one: 'in {{count}} day',
      inDays_other: 'in {{count}} days',
    },
  },
  deck: {
    editDeckTitle: 'Edit {{languageName}}',
    studyRemindersTitle: 'Study reminders for {{languageName}}',
  },
  editCard: {
    updateFailedTitle: 'Error: Card update failed',
    updateFailedMessage:
      'Oops! Something went wrong while attempting to update the card. Please try again.',
    deletePrompt: {
      title: 'Delete this card?',
      message: 'This operation cannot be undone.',
    },
    unableToDelete: 'Unable to delete the card. Please try again.',
    deletingCard: 'Deleting card...',
    resetPrompt: {
      title: 'Reset study progress?',
      message: 'This operation cannot be undone.',
      confirm: 'Reset',
    },
    unableToReset: 'Unable to reset study progress. Please try again.',
    addOrRemoveTags: 'Add or remove card tags (folders)',
    resetStudyProgress: 'Reset study progress',
    rawCardData: 'Raw card data',
  },
  editDeck: {
    studySettings: 'Study settings',
    exportDeck: 'Export language',
    studyReminders: 'Study reminders',
    studyRemindersUnregisteredHint:
      'Study reminders are temporarily disabled for unregistered users.',
    hideDefinitions: 'Hide definitions',
    hideDefinitionsHint:
      'The app will make an attempt to show less definitions in My cards and during the study.',
    deckContainsCards_one: 'You have {{count}} card.',
    deckContainsCards_other: 'You have {{count}} cards.',
    deleteDeck: 'Delete this language',
    deleteDeckPrompt: {
      title: 'Delete {{languageName}}?',
      message: 'This operation cannot be undone.',
    },
    deleteDeckError: {
      title: 'Error: Trouble deleting language',
      message:
        'Oops! Something went wrong while attempting to delete the language. Please try again later.',
    },
  },
  generateCards: {
    loadingPreset: 'Loading translation preset...',
    errorUnable: 'Unable to generate cards. Please try again.',
    intro: 'Type what you need, and Vocably will generate cards for you.',
    experimental:
      'This is an experimental feature. <feedback>Let me know</feedback> if you find any bugs or have any suggestions.',
    examplesToTry: 'Some examples to try:',
    exampleIrregularVerbs: 'irregular verbs',
    exampleAnimals: 'animals',
    examplePopularIdioms: 'popular idioms',
    placeholder: 'Just anything...',
    generating: 'Generating cards...',
    followingWillBeGenerated: 'The following cards will be generated:',
  },
  languageSelector: {
    addNewLanguage: 'Add new language',
    popularLanguages: 'Popular languages',
    selected: 'Selected',
    availableLanguages: 'Available languages',
    select: 'Select',
    studyLanguage: 'Study Language',
    yourLanguages: 'Your languages',
    deviceLanguage: 'Device language',
    preferredLanguages: 'Preferred languages',
    motherTongue: 'Mother Tongue',
    preferred: 'Popular languages',
    search: 'Search...',
  },
  lookUp: {
    loadingPreset: 'Loading translation preset...',
    lookUpFailedTitle: 'Error: Look up failed',
    lookUpFailedMessage:
      'Oops! Something went wrong while attempting to look up. Please try again later.',
    searchPlaceholder: 'Any word in any language',
    lookingForCollections: 'Looking for card collections?',
    tryAiGenerator: 'Try the AI card generator',
    questionsOrSuggestions: 'Questions or suggestions?',
    connectOnTelegram: 'Connect on Telegram',
    joinDiscord: 'Join Discord',
    sendMessage: 'Send a message',
    conductingAnalysis: 'Conducting further analysis...',
    selectLanguageLearning: "Select the language you're learning.",
    selectMotherTongue: 'Select your mother tongue',
  },
  notifications: {
    checking: 'Checking...',
    loadingPreset: 'Loading preset...',
    loadFailed: {
      sorry: "I'm very sorry.",
      cannotLoad: "The system can't load the study reminder status.",
      informed: 'I have already been informed about it.',
      tryAgain: 'Please try again later.',
    },
    enabledFor: 'Enabled for {{languageString}}',
    remindersDescription:
      'Study reminders are sent once a day to remind you to review your {{languageName}} cards.',
    failedTitle: 'Study reminders failed',
    failedAndroidMessage:
      "Notifications can't be set automatically. Please enable them in the App Info settings.",
    failedIosMessage:
      "Notifications can't be set automatically. Please enable them in Settings → Vocably.",
    deniedAndroidMessage:
      "Notifications can't be set automatically. Please enable them in the App Info settings.",
    deniedIosMessage:
      "Notifications can't be set automatically. Please enable them in Settings → Vocably.",
    openSettings: 'Open Settings',
    enableReminders: 'Enable reminders',
    receiveAt: 'Time',
  },
  study: {
    loading: 'Loading...',
    finish: 'Finish',
    takeOneMoreRound: 'Take one more round',
    cardUpdateFailedTitle: 'Error: Card update failed',
    cardUpdateNetworkError:
      "Your answer wasn't saved due to a lost connection. The session will stop and resume from the failed answer.",
    cardUpdateTechnicalError:
      'Oops! Unable to continue the study session due to a technical issue. Please try again later.',
    exitStudySession: 'Exit study session',
    tapDot: {
      touch: 'Touch',
    },
    swipeGrade: {
      notYet: 'Not yet',
      almost: 'Almost',
      gotIt: 'Got it!',
    },
    arrangeByLetters: {
      showMeTheAnswer: 'Show me the answer',
    },
    cardBack: {
      emptyCardMessage:
        'This card has no translations or definitions. Edit this card.',
    },
    multiChoice: {
      showCorrectAnswer: 'Show the correct answer',
    },
    reverseCardBack: {
      theAnswerIs: 'The answer is',
    },
    reverseCardFront: {
      examples_one: 'Example:',
      examples_other: 'Examples:',
    },
    motivationalQuotes: {
      '0': 'Perseverance is not a long race; it is many short races one after the other.',
      '1': 'A river cuts through rock not because of its power, but because of its persistence.',
      '2': 'Persistence guarantees that results are inevitable.',
      '3': 'Patience and persistence are the keys to unlocking greatness.',
      '4': 'Every step forward, no matter how small, is progress.',
      '5': 'Persistence turns dreams into reality; every effort is a seed for success.',
      '6': 'Every time you push forward, you rewrite your story to include success.',
      '7': 'Keep believing in yourself — your persistence is your superpower.',
      '8': 'Success is built on the bricks of persistence, laid one by one.',
      '9': 'The universe moves for those who never stop moving forward.',
      '10': 'The energy you put in today fuels the success of tomorrow.',
      '11': 'Persistence transforms the impossible into the inevitable.',
      '12': 'Each word you learn brings you closer to understanding a new culture.',
      '13': "Language learning is a marathon, not a sprint. You're doing great!",
      '14': 'Persistence is the secret ingredient in becoming fluent. Keep going!',
      '15': 'Practice is the key to success in language learning. You are on the right track!',
      '16': 'A second language is not just a skill, but a gift that keeps giving.',
      '17': "Each time you study, you're rewriting your brain for success.",
      '18': 'A language learner is a world explorer in disguise.',
      '19': "Every mistake you make while learning is proof that you're growing.",
      '20': 'Languages are the keys to the world; every word you master unlocks new doors.',
      '21': "Fluency is not about speed; it's about showing up and practicing every day.",
      '22': "A new language doesn't just teach you words; it teaches you new ways of thinking.",
      '23': 'Small, consistent efforts lead to big, life-changing results in language learning.',
      '24': "You'll never regret the time you spend learning a language — it's an investment in yourself.",
      '25': 'Every language you learn adds a new dimension to your identity.',
      '26': 'Even if it feels hard today, tomorrow your efforts will make you smile.',
      '27': 'The journey to fluency is a story worth telling — keep writing it.',
    },
  },
  exportDeck: {
    title: 'Export {{languageName}}',
    loadingCards: 'Loading cards...',
    advancedExportInfo:
      'More advanced export functionality is available in the web browser only for registered users.',
    loginWithAccount: 'Login with your account',
    deprecatedCardsExcluded:
      'Some cards were excluded because they were created with a deprecated dictionary provider.',
    copyToClipboard: 'Copy to Clipboard',
    copiedToClipboard: 'Copied to clipboard.',
  },
  loginModal: {
    syncAcrossDevices: 'Synchronize across devices',
    useBrowserExtensions: 'Use browser extensions',
    importExportCsv: 'Import and export CSV data',
  },
  loginForm: {
    screenTitle: 'Sign in or Register',
    signIn: 'Sign in or create an account',
    bySigningInYouAgreeToOur: 'By signing in, you agree to our',
    termsAndConditions: 'Terms and Conditions',
    and: 'and',
    privacyPolicy: 'Privacy Policy',
  },
  languageScreen: {
    motherTongueQuestion: 'What is your mother tongue?',
    motherTongueHint: 'Select the language you can speak fluently.',
  },
  welcome: {
    formIntro: 'To get started, please answer a few questions.',
    questionStudyLanguage: 'What language do you study?',
    multipleLanguagesHint:
      'You can learn multiple languages. For now, just pick one to get started.',
    setup: 'Setup',
    previous: 'Previous',
    next: 'Next',
    skip: 'Skip',
    goToApp: 'Go to the app',
    slideCard: {
      looksUpWords:
        'Vocably looks up words and makes flashcards like this one:',
      translatesWords:
        'Vocably translates words and makes flashcards like this one:',
      fallbackNote: 'Note from the author of Vocably',
      fallbackBody:
        "These card samples are inaccurate and confusing. I apologize for that. I'm working on accurate examples for onboarding users who study {{sourceLang}} and speak {{targetLang}}.",
      saveFlashcardsBefore: 'You can save',
      saveFlashcardsAfter:
        'your flashcards and study them with the spaced repetition system.',
    },
    slideLookUp: {
      intro:
        'Do you see or hear a new word or phrase in <bold>{{sourceLanguage}}</bold>? Look it up and save it as a flashcard!',
    },
    slideReverseTranslate: {
      intro:
        "Do you want to say something in <bold>{{sourceLanguage}}</bold> but don't know the word? Look it up in <bold>{{targetLanguage}}</bold>.",
    },
    slideSelectToTranslate: {
      into_Safari:
        'Do you see a new word in Mobile Safari? Look it up with the <bold>Vocably extension</bold>.',
      into_Android:
        'Do you see a new word on the screen of your Android device?',
      androidStep1: 'Select the word',
      androidStep2: 'Click',
      androidStep3: 'Click "Translate with Vocably"',
    },
    slideDesktopBrowser: {
      intro: 'Do you use a desktop computer? Install',
      or: 'or',
      browserExtensionSuffix: 'browser extension to surf the web in',
    },
  },
  languages: {
    loading: 'Loading languages...',
  },
  auth: {
    authenticating: 'Authenticating...',
    sessionExpired: 'Your authentication session is expired.',
    signInAgain: 'Sign in again',
    anonymousUserError: {
      title: 'Unable to create anonymous user',
      message: 'A critical error while creating an anonymous user occurred.',
    },
  },
  tagMenu: {
    intro:
      'Tags are like groups, or folders, but better. Press "Add new tag" to begin.',
    addNewTag: 'Add new tag',
    editTag: 'Edit {{title}}',
    swipeLeftToEdit: 'Swipe left to edit the tag.',
    swipeRightToDelete:
      'Swipe right to delete the tag. Your cards will not be deleted.',
    removeTagError:
      'An error occurred while removing the tag. Please try again.',
    updateTagError:
      'An error occurred while updating the tag. Please try again.',
    add: 'Add',
    newTagName: 'New tag name',
  },
  cardForm: {
    wordOrPhrase: 'Word or phrase',
    translation: 'Translation',
    partOfSpeech: 'Part of Speech',
    transcriptionIpa: 'Transcription (IPA)',
    definition: 'Definition',
    example: 'Example',
    partsOfSpeech: {
      noun: 'noun',
      verb: 'verb',
      adjective: 'adjective',
      adverb: 'adverb',
      phrase: 'phrase',
    },
  },
  discoverySurvey: {
    screenTitle: 'Last question',
    question: 'How did you hear about Vocably?',
    whatIsIt: 'What is it?',
    typePlaceholder: 'Type here',
    sources: {
      playStore: 'Play Store',
      appStore: 'App Store',
      fromAFriend: 'From a friend',
      other: 'Other',
    },
  },
  tips: {
    menu: {
      editCards: 'Edit cards',
      groupCards: 'Group cards (in folders)',
      importExportCsv: 'Import and export CSV',
      studyPlan: 'Study plan',
      androidTranslate:
        'How to translate any selected text in any app on your mobile.',
      iosTranslate:
        'Translate any word on any website with Vocably iOS Safari Extension.',
      desktopExtension:
        'Are you using Chrome or Safari on your computer? Try the Vocably extension.',
      grammarChecker:
        'Try the new grammar checker tool. It will not only fix your mistakes but also explain why.',
      provideFeedback: 'Provide feedback',
      feedbackBody:
        'Are you missing any crucial feature or simply want to share your opinion about Vocably with me? I would love to hear from you.',
      supportBody:
        'Want to help Vocably grow? Any of these actions would make an incredible difference for this project.',
      rate: 'Rate the app on {{storeName}}',
      shareOnFacebook: 'Share the app with your friends on Facebook',
      shareOnTwitter: 'Share the app on Twitter/X',
    },
    howToEditCards: {
      title: 'Edit cards',
      intro: 'You can edit cards in two ways:',
      myCardsItem:
        '• <bold>My cards screen</bold>: Swipe a card left to reveal the edit menu.',
      studySessionItem:
        '• <bold>Study session</bold>: Tap the "Edit" (<editIcon/>) button.',
    },
    howToGroupCards: {
      title: 'Group cards',
    },
    howToImportAndExport: {
      title: 'Import and export CSV',
      importCards: 'Import cards',
      importNote:
        '<alertIcon/> Import is available only for registered users. You will be redirected to the website.',
      exportCards: 'Export your {{languageName}} cards',
    },
    howToViewStudyStatistics: {
      title: 'Study plan',
      para1:
        'The <bold>Study Plan</bold> is enabled by default and provides an overview of the cards scheduled for today, upcoming days, and those that have expired and need review. This helps you stay on track, catch up on overdue cards, and approach your learning more strategically.',
      para2:
        'To view your study plan, go to the <myCards>My cards</myCards> tab and tap the <chartBoxIcon/> button in the top-left corner.',
      para3:
        '<bold>Important:</bold> the study plan is not available when cards for study are selected randomly. To disable the random card selection, go to <studySettings>Study settings</studySettings>.',
    },
  },
  shareIntent: {
    login: {
      openVocablyToSignIn: 'Open Vocably to sign in.',
      openVocably: 'Open Vocably',
    },
    receivingText: 'Receiving the text...',
  },
  paymentSuccess: {
    thankYou:
      'Thank you for giving Vocably a chance. Your support means a lot to me.',
    rateButton: 'Rate Vocably on {{storeName}}',
    feedbackBefore:
      "If you are missing or don't like anything, you can always let me know in Discord, Telegram, or",
    feedbackLink: 'right in the app',
    feedbackAfter: '. I take every feedback seriously.',
  },
  requestFeedback: {
    question:
      'Do you like Vocably? Your rating on {{storeName}} will take less than a minute and help this project.',
    rateButton: 'Rate Vocably on {{storeName}}',
    later: 'Ask me later',
    feedbackBefore:
      "If you are missing or don't like something, you can always",
    feedbackLink: 'let me know',
    feedbackAfter: '. I take every feedback seriously.',
    neverAgain: "I don't want to see this message again",
  },
  cardDefinition: {
    present: 'Present:',
    past: 'Past:',
    plural: 'Plural:',
  },
  streak: {
    consecutiveDays_one: 'consecutive day.',
    consecutiveDays_other: 'consecutive days.',
    days: {
      '0': 'Sun',
      '1': 'Mon',
      '2': 'Tue',
      '3': 'Wed',
      '4': 'Thu',
      '5': 'Fri',
      '6': 'Sat',
    },
  },
  language: languageTranslations.en,
};

export default translations;
