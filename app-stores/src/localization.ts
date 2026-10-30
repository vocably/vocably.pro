import type { Language } from './languages';
import type { AnalysisItem, GoogleLanguage } from '@vocably/model';

// A headline and the line under it. *Words between asterisks* are shown in
// the primary color.
type Heading = [string, string];

type ChromeWebStore = {
  // The headings of the screenshots, in store order.
  save: Heading;
  youtube: Heading;
  calls: Heading;
  // The phone and the browser together.
  study: Heading;
  // The highlights listed on the study screenshot.
  phoneFeatures: [string, string, string];
  everywhere: Heading;
  // The small line above the store name on the App Store and Google Play
  // badges.
  appStoreBadge: string;
  googlePlayBadge: string;
};

type Translations = {
  // The headline of the first screenshot.
  title: string;
  // The headline of the App Store header.
  iosHeaderTitle: string;
  // The headline of the Play feature graphic.
  featureGraphicTitle: string;
  // Shown under the flags of the first screenshot.
  languageCount: string;
  // The search field text of the second screenshot.
  search: string;
  sourceLanguage: GoogleLanguage;
  // The first item /analyze returns for `search`.
  searchItem: AnalysisItem;
  // All the items /analyze returns for `search`, shown on the phone of the
  // last Chrome Web Store screenshot.
  phoneSearchItems: AnalysisItem[];
  // Wrong answers for `searchItem` in the multi-choice study screenshot.
  incorrectTranslations: [string, string, string];
  // The grade buttons of the flashcard study screenshot, as the mobile app
  // words them (study.swipeGrade): not yet, almost, got it.
  grades: [string, string, string];
  // The hint above the grade buttons of the flashcard study screenshot.
  revealHint: string;
  // The add button and the examples label of the analysis item, as the
  // extension words them.
  learnButton: string;
  example: string;
  // The headline of the second screenshot and the line under it.
  translate: string;
  translateSub: string;
  // The headline of the third screenshot and the line under it.
  learn: string;
  learnSub: string;
  // The headline of the Safari extension screenshot and the line under it.
  extension: string;
  extensionSub: string;
  // The Chrome Web Store screenshots.
  cws: ChromeWebStore;
  // The web page text of the first Chrome Web Store screenshot, in
  // `sourceLanguage`: before, the selected `searchItem.source`, after.
  article: [string, string, string];
  // The YouTube subtitle of the Chrome Web Store screenshot, split the same
  // way.
  subtitle: [string, string, string];
  // The web page text of the Safari extension screenshot, in
  // `sourceLanguage`: before, the selected `searchItem.source`, after.
  pageText: [string, string, string];
  // The headline of the Android text selection screenshot and the line
  // under it. It shows `pageText` too.
  androidExtension: string;
  androidExtensionSub: string;
  // The Android text selection menu item that searches the selected text.
  webSearch: string;
  // The headline of the Android e-book screenshot and the line under it. It
  // shows `pageText` too.
  ebook: string;
  ebookSub: string;
  // The button that closes the app's share sheet, `common.done` in the app.
  done: string;
  // The headline of the desktop browser extension screenshot and the line
  // under it.
  desktopExtension: string;
  desktopExtensionSub: string;
  // The headline of the custom card lists screenshot, the line under it, the
  // chat message that asks for the list, and the generated cards: a verb in
  // `sourceLanguage` and its translation.
  customLists: string;
  customListsSub: string;
  customListsPrompt: string;
  customListsCards: [string, string][];
};

// The verbs the custom card lists screenshot generates for English sources.
const englishVerbs = [
  'achieve',
  'decide',
  'improve',
  'explain',
  'notice',
  'avoid',
  'convince',
  'borrow',
  'forgive',
  'suggest',
];

const withTranslations = (translations: string[]): [string, string][] =>
  englishVerbs.map((verb, index) => [verb, translations[index]]);

// The page the Safari extension screenshot shows for English sources.
const reliablePage: [string, string, string] = [
  'they built a ',
  'reliable',
  ' engine that',
];

// The Chrome Web Store screenshots' web page and YouTube subtitle for German
// and for English sources.
const magicArticle: [string, string, string] = [
  'Der alte Zauberer lebte am Rande des Dorfes. Mit seiner ',
  'Magie',
  ' ließ er jeden Abend kleine Lichter über dem Marktplatz tanzen. Niemand wusste, woher seine Kunst kam, doch alle kamen, um ihn zu sehen.',
];
const magicSubtitle: [string, string, string] = [
  'Das ist die ',
  'Magie',
  ' des Augenblicks.',
];
const reliableArticle: [string, string, string] = [
  'After years of testing in the harshest conditions, it was a ',
  'reliable',
  ' engine that could run for weeks without a single failure. Engineers from all over the world came to see it work.',
];
const reliableSubtitle: [string, string, string] = [
  'It is the most ',
  'reliable',
  ' way to get there.',
];

// The copy shown on the assets, per interface language.
export const localization: Record<Language, Translations> = {
  en: {
    title: 'A language-\nlearning tool.',
    iosHeaderTitle: 'A language-learning tool.',
    featureGraphicTitle:
      'A fine combination of a dictionary and a learning system.',
    languageCount: '100+ languages.',
    search: 'magic',
    sourceLanguage: 'de',
    searchItem: {
      source: 'die Magie',
      translation: 'magic',
      definitions: [
        'Die Kunst, übernatürliche Kräfte zu beeinflussen oder zu nutzen.',
        'Eine geheimnisvolle, faszinierende Wirkung oder Ausstrahlung.',
      ],
      examples: [
        'Schwarze Magie.',
        'Die Magie des Augenblicks.',
        'Er glaubt an Magie.',
      ],
      partOfSpeech: 'noun',
      ipa: 'maˈɡiː',
      g: 'feminine',
      number: 'singular',
      pluralForm: 'die Magien',
    },
    phoneSearchItems: [
      {
        source: 'die Magie',
        translation: 'magic, charm',
        definitions: [
          'Die Kunst, übernatürliche Kräfte zu beeinflussen oder zu nutzen.',
          'Eine geheimnisvolle, faszinierende Wirkung oder Ausstrahlung.',
        ],
        examples: [
          'Schwarze Magie.',
          'Die Magie des Augenblicks.',
          'Er glaubt an Magie.',
        ],
        partOfSpeech: 'noun',
        ipa: 'maˈɡiː',
        g: 'feminine',
        number: 'singular',
        pluralForm: 'die Magien',
        frequency: 5,
      },
      {
        source: 'der Zauber',
        translation: 'magic, spell, charm',
        definitions: [
          'Anwendung übernatürlicher Kräfte',
          'Faszinierende, unwiderstehliche Wirkung oder Ausstrahlung',
          'Ein Zauberspruch oder eine magische Handlung',
        ],
        examples: [
          'Der Zauber wirkte sofort.',
          'Sie erlag seinem Zauber.',
          'Ein Hauch von Zauber lag in der Luft.',
        ],
        partOfSpeech: 'noun',
        ipa: 'ˈt͡saʊ̯bɐ',
        g: 'masculine',
        number: 'singular',
        pluralForm: 'die Zauber',
        frequency: 5,
      },
      {
        source: 'magisch',
        translation: 'magical, magic',
        definitions: ['durch Magie hervorgerufen', 'zauberhaft, wundersam'],
        examples: ['ein magischer Moment', 'magische Kräfte'],
        partOfSpeech: 'adjective',
        ipa: 'ˈmaːɡɪʃ',
        number: 'singular',
        frequency: 4,
      },
    ],
    incorrectTranslations: ['luck', 'mystery', 'dream'],
    learnButton: 'Learn',
    grades: ['Not yet', 'Almost', 'Got it!'],
    revealHint: 'Tap to see the translation',
    example: 'Example:',
    translate: 'Translate',
    translateSub: 'any words or phrases.',
    learn: 'Learn',
    learnSub: 'with interactive practice.',
    extension: 'Translate and save',
    extensionSub: 'with a single click using\nthe iOS Safari Extension.',
    cws: {
      save: [
        'Save *translated* words',
        'An AI dictionary that lets you save new words and phrases.',
      ],
      youtube: [
        'Click any word in *YouTube* subtitles',
        'Vocably translates the word and helps you learn it.',
      ],
      calls: [
        '*Translate* and *save* during video calls',
        'Perfect for anyone taking lessons with an online tutor.',
      ],
      study: [
        '*Study* them *everywhere*',
        'Review saved words with spaced repetition on your phone or in your browser.',
      ],
      phoneFeatures: [
        'Synced across devices',
        'High-quality mobile app',
        'A dictionary that is always with you',
      ],
      everywhere: [
        '*Translate* no matter what you are doing',
        'Vocably is an ecosystem built for people who actively use a foreign language.',
      ],
      appStoreBadge: 'Download on the',
      googlePlayBadge: 'GET IT ON',
    },
    article: magicArticle,
    subtitle: magicSubtitle,
    pageText: ['mit seiner ', 'Magie', ' und ließ'],
    androidExtension: 'Select, translate,\nand save',
    androidExtensionSub: 'words while surfing the web\nin any mobile browser.',
    webSearch: 'Web search',
    ebook: 'Long-press on\nany word while\nreading e-books.',
    ebookSub: 'Vocably integrates with most\nAndroid e-book readers.',
    done: 'Done',
    desktopExtension: 'Browse the web\nand watch YouTube',
    desktopExtensionSub:
      'with the Vocably extension\nfor Chrome, Safari, and Edge\ndesktop browsers.',
    customLists: 'Generate custom\ncard lists',
    customListsSub: 'by prompting the AI.',
    customListsPrompt: 'popular verbs',
    customListsCards: [
      ['entscheiden', 'to decide'],
      ['erreichen', 'to achieve, to reach'],
      ['verbessern', 'to improve'],
      ['erklären', 'to explain'],
      ['bemerken', 'to notice'],
      ['vermeiden', 'to avoid'],
      ['überzeugen', 'to convince'],
      ['ausleihen', 'to borrow'],
      ['verzeihen', 'to forgive'],
      ['vorschlagen', 'to suggest'],
    ],
  },
  es: {
    title: 'Una herramienta para aprender idiomas.',
    iosHeaderTitle: 'Una herramienta para aprender idiomas.',
    featureGraphicTitle:
      'Una combinación bastante buena de diccionario y sistema de aprendizaje.',
    languageCount: 'Más de 100 idiomas.',
    search: 'confiable',
    sourceLanguage: 'en',
    searchItem: {
      source: 'reliable',
      translation: 'fiable, confiable',
      definitions: [
        'consistently good in quality or performance',
        'able to be trusted',
      ],
      examples: ['a reliable car', 'trustworthy analysis'],
      partOfSpeech: 'adjective',
      ipa: 'rɪˈlaɪəbl',
      number: 'singular',
    },
    phoneSearchItems: [
      {
        source: 'reliable',
        translation: 'fiable, confiable',
        definitions: [
          'consistently good in quality or performance',
          'able to be trusted',
        ],
        examples: ['a reliable car', 'trustworthy analysis'],
        partOfSpeech: 'adjective',
        ipa: 'rɪˈlaɪəbl',
        number: 'singular',
        frequency: 7,
      },
      {
        source: 'trustworthy',
        translation: 'fiable, de confianza',
        definitions: [
          'deserving of trust or confidence; dependable and reliable',
        ],
        examples: [
          'She is a trustworthy friend.',
          'A trustworthy source for information.',
        ],
        partOfSpeech: 'adjective',
        ipa: 'ˈtrʌstˌwɜːrði',
        number: 'singular',
        frequency: 6,
      },
      {
        source: 'dependable',
        translation: 'fiable, confiable',
        definitions: ['capable of being relied on; trustworthy'],
        examples: ['a dependable friend', 'a dependable source'],
        partOfSpeech: 'adjective',
        ipa: 'dɪˈpɛndəbl',
        number: 'singular',
        frequency: 5,
      },
    ],
    incorrectTranslations: ['rápido, veloz', 'caro, costoso', 'frágil, débil'],
    learnButton: 'Aprender',
    grades: ['Aún no', 'Casi', '¡Lo tengo!'],
    revealHint: 'Toca para ver la traducción',
    example: 'Ejemplo:',
    translate: 'Traduce',
    translateSub: 'cualquier palabra o frase.',
    learn: 'Aprende',
    learnSub: 'con cuestionarios y preguntas interactivas.',
    extension: 'Traduce y guarda',
    extensionSub: 'con un solo clic usando la extensión de Safari para iOS.',
    cws: {
      save: [
        'Guarda las palabras *traducidas*',
        'Un diccionario con IA para guardar palabras y frases nuevas.',
      ],
      youtube: [
        'Haz clic en cualquier palabra de los subtítulos de *YouTube*',
        'Vocably la traduce y te ayuda a aprenderla.',
      ],
      calls: [
        '*Traduce* y *guarda* durante videollamadas',
        'Ideal para quienes toman clases con un profesor en línea.',
      ],
      study: [
        '*Estúdialas* en *cualquier lugar*',
        'Repasa las palabras guardadas con repetición espaciada en el móvil o en el navegador.',
      ],
      phoneFeatures: [
        'Sincronizado entre dispositivos',
        'Aplicación móvil de alta calidad',
        'Un diccionario que siempre está contigo',
      ],
      everywhere: [
        '*Traduce* hagas lo que hagas',
        'Vocably es un ecosistema creado para quienes usan activamente un idioma extranjero.',
      ],
      appStoreBadge: 'Descárgalo en el',
      googlePlayBadge: 'DISPONIBLE EN',
    },
    article: reliableArticle,
    subtitle: reliableSubtitle,
    pageText: reliablePage,
    androidExtension: 'Selecciona, traduce y guarda',
    androidExtensionSub:
      'palabras mientras navegas por la web en cualquier navegador móvil.',
    webSearch: 'Búsqueda web',
    ebook: 'Pulsa cualquier palabra al leer libros electrónicos.',
    ebookSub:
      'Vocably se integra con la mayoría de los lectores de libros electrónicos para Android.',
    done: 'Listo',
    desktopExtension: 'Navega por la web y mira YouTube',
    desktopExtensionSub:
      'con la extensión de Vocably para los navegadores de escritorio Chrome, Safari y Edge.',
    customLists: 'Genera listas de tarjetas personalizadas',
    customListsSub: 'pidiéndoselo a la IA.',
    customListsPrompt: 'verbos populares',
    customListsCards: withTranslations([
      'lograr',
      'decidir',
      'mejorar',
      'explicar',
      'notar',
      'evitar',
      'convencer',
      'pedir prestado',
      'perdonar',
      'sugerir',
    ]),
  },
  pt: {
    title: 'Uma ferramenta para aprender idiomas.',
    iosHeaderTitle: 'Uma ferramenta para aprender idiomas.',
    featureGraphicTitle:
      'Uma combinação bem boa de dicionário e sistema de aprendizado.',
    languageCount: 'Mais de 100 idiomas.',
    search: 'confiável',
    sourceLanguage: 'en',
    searchItem: {
      source: 'reliable',
      translation: 'confiável, fidedigno',
      definitions: [
        'consistently good in quality or performance',
        'able to be trusted',
      ],
      examples: ['a reliable car', 'trustworthy analysis'],
      partOfSpeech: 'adjective',
      ipa: 'rɪˈlaɪəbl',
      number: 'singular',
    },
    phoneSearchItems: [
      {
        source: 'reliable',
        translation: 'confiável, fidedigno',
        definitions: [
          'consistently good in quality or performance',
          'able to be trusted',
        ],
        examples: ['a reliable car', 'trustworthy analysis'],
        partOfSpeech: 'adjective',
        ipa: 'rɪˈlaɪəbl',
        number: 'singular',
        frequency: 7,
      },
      {
        source: 'trustworthy',
        translation: 'confiável, fidedigno',
        definitions: [
          'deserving of trust or confidence; dependable and reliable',
        ],
        examples: [
          'She is a trustworthy friend.',
          'A trustworthy source for information.',
        ],
        partOfSpeech: 'adjective',
        ipa: 'ˈtrʌstˌwɜːrði',
        number: 'singular',
        frequency: 6,
      },
      {
        source: 'dependable',
        translation: 'confiável, seguro',
        definitions: ['capable of being relied on; trustworthy'],
        examples: ['a dependable friend', 'a dependable source'],
        partOfSpeech: 'adjective',
        ipa: 'dɪˈpɛndəbl',
        number: 'singular',
        frequency: 5,
      },
    ],
    incorrectTranslations: ['rápido, veloz', 'caro, custoso', 'frágil, fraco'],
    learnButton: 'Aprender',
    grades: ['Ainda não', 'Quase', 'Acertei!'],
    revealHint: 'Toque para ver a tradução',
    example: 'Exemplo:',
    translate: 'Traduza',
    translateSub: 'quaisquer palavras ou frases.',
    learn: 'Aprenda',
    learnSub: 'com testes e perguntas interativas.',
    extension: 'Traduza e salve',
    extensionSub: 'com um único clique usando a extensão do Safari para iOS.',
    cws: {
      save: [
        'Salve as palavras *traduzidas*',
        'Um dicionário com IA para salvar novas palavras e frases.',
      ],
      youtube: [
        'Clique em qualquer palavra das legendas do *YouTube*',
        'O Vocably traduz a palavra e ajuda você a aprendê-la.',
      ],
      calls: [
        '*Traduza* e *salve* durante videochamadas',
        'Perfeito para quem tem aulas com um professor on-line.',
      ],
      study: [
        '*Estude-as* em *qualquer lugar*',
        'Revise as palavras salvas com repetição espaçada no celular ou no navegador.',
      ],
      phoneFeatures: [
        'Sincronizado entre dispositivos',
        'Aplicativo móvel de alta qualidade',
        'Um dicionário que está sempre com você',
      ],
      everywhere: [
        '*Traduza* não importa o que esteja fazendo',
        'O Vocably é um ecossistema criado para quem usa ativamente um idioma estrangeiro.',
      ],
      appStoreBadge: 'Baixar na',
      googlePlayBadge: 'DISPONÍVEL NO',
    },
    article: reliableArticle,
    subtitle: reliableSubtitle,
    pageText: reliablePage,
    androidExtension: 'Selecione, traduza e salve',
    androidExtensionSub:
      'palavras enquanto navega na web em qualquer navegador móvel.',
    webSearch: 'Pesquisa na web',
    ebook: 'Toque em qualquer palavra ao ler e-books.',
    ebookSub:
      'O Vocably se integra à maioria dos leitores de e-books para Android.',
    done: 'Concluído',
    desktopExtension: 'Navegue na web e assista ao YouTube',
    desktopExtensionSub:
      'com a extensão do Vocably para os navegadores de desktop Chrome, Safari e Edge.',
    customLists: 'Gere listas de cartões personalizadas',
    customListsSub: 'pedindo à IA.',
    customListsPrompt: 'verbos populares',
    customListsCards: withTranslations([
      'alcançar',
      'decidir',
      'melhorar',
      'explicar',
      'notar',
      'evitar',
      'convencer',
      'pedir emprestado',
      'perdoar',
      'sugerir',
    ]),
  },
  ru: {
    title: 'Инструмент для изучения языков.',
    iosHeaderTitle: 'Инструмент для изучения языков.',
    featureGraphicTitle:
      'Довольно качественная комбинация словаря и системы обучения.',
    languageCount: 'Более 100 языков.',
    search: 'надёжный',
    sourceLanguage: 'en',
    searchItem: {
      source: 'reliable',
      translation: 'надежный, достоверный',
      definitions: [
        'consistently good in quality or performance',
        'able to be trusted',
      ],
      examples: ['a reliable car', 'trustworthy analysis'],
      partOfSpeech: 'adjective',
      ipa: 'rɪˈlaɪəbl',
      number: 'singular',
    },
    phoneSearchItems: [
      {
        source: 'reliable',
        translation: 'надежный, достоверный',
        definitions: [
          'consistently good in quality or performance',
          'able to be trusted',
        ],
        examples: ['a reliable car', 'trustworthy analysis'],
        partOfSpeech: 'adjective',
        ipa: 'rɪˈlaɪəbl',
        number: 'singular',
        frequency: 7,
      },
      {
        source: 'dependable',
        translation: 'надежный, достоверный',
        definitions: ['capable of being relied on; trustworthy'],
        examples: ['a dependable friend', 'a dependable source'],
        partOfSpeech: 'adjective',
        ipa: 'dɪˈpɛndəbl',
        number: 'singular',
        frequency: 5,
      },
      {
        source: 'trustworthy',
        translation: 'надежный, достоверный, заслуживающий доверия',
        definitions: [
          'deserving of trust or confidence; dependable and reliable',
        ],
        examples: [
          'She is a trustworthy friend.',
          'A trustworthy source for information.',
        ],
        partOfSpeech: 'adjective',
        ipa: 'ˈtrʌstˌwɜːrði',
        number: 'singular',
        frequency: 6,
      },
    ],
    incorrectTranslations: [
      'быстрый, скорый',
      'дорогой, ценный',
      'хрупкий, слабый',
    ],
    learnButton: 'Учить',
    grades: ['Ещё нет', 'Почти', 'Знаю!'],
    revealHint: 'Нажмите для перевода',
    example: 'Пример:',
    translate: 'Переводите',
    translateSub: 'любые слова и фразы.',
    learn: 'Учите',
    learnSub: 'при помощи тестов и интерактивных вопросов.',
    extension: 'Переводите и сохраняйте',
    extensionSub: 'в один клик с помощью расширения Safari для iOS.',
    cws: {
      save: [
        'Сохраняйте *переведенные* слова',
        'ИИ-словарь, в котором можно сохранять новые слова и фразы.',
      ],
      youtube: [
        'Нажмите на любое слово в субтитрах *YouTube*',
        'Vocably переведет слово и поможет его выучить.',
      ],
      calls: [
        '*Переводите* и *сохраняйте* во время видеозвонков',
        'Идеально для тех, кто занимается с онлайн-репетитором.',
      ],
      study: [
        '*Учите* их *где угодно*',
        'Повторяйте сохраненные слова по методу интервальных повторений на телефоне или в браузере.',
      ],
      phoneFeatures: [
        'Синхронизация между устройствами',
        'Качественное мобильное приложение',
        'Словарь, который всегда с вами',
      ],
      everywhere: [
        '*Переводите*, чем бы вы ни занимались',
        'Vocably — это экосистема для тех, кто активно пользуется иностранным языком.',
      ],
      appStoreBadge: 'Загрузите в',
      googlePlayBadge: 'ДОСТУПНО В',
    },
    article: reliableArticle,
    subtitle: reliableSubtitle,
    pageText: reliablePage,
    androidExtension: 'Выделяйте, переводите и сохраняйте',
    androidExtensionSub:
      'слова, просматривая сайты в любом мобильном браузере.',
    webSearch: 'Веб-поиск',
    ebook: 'Нажмите на любое слово, читая электронные книги.',
    ebookSub: 'Vocably интегрируется с большинством читалок для Android.',
    done: 'Готово',
    desktopExtension: 'Читайте сайты и смотрите YouTube',
    desktopExtensionSub:
      'с расширением Vocably для десктопных браузеров Chrome, Safari и Edge.',
    customLists: 'Создавайте свои списки карточек',
    customListsSub: 'запросом к ИИ.',
    customListsPrompt: 'популярные глаголы',
    customListsCards: withTranslations([
      'достигать',
      'решать',
      'улучшать',
      'объяснять',
      'замечать',
      'избегать',
      'убеждать',
      'одалживать',
      'прощать',
      'предлагать',
    ]),
  },
  uk: {
    title: 'Інструмент для вивчення мов.',
    iosHeaderTitle: 'Інструмент для вивчення мов.',
    featureGraphicTitle:
      'Досить якісне поєднання словника та системи навчання.',
    languageCount: 'Понад 100 мов.',
    search: 'надійний',
    sourceLanguage: 'en',
    searchItem: {
      source: 'reliable',
      translation: 'надійний, достовірний',
      definitions: [
        'consistently good in quality or performance',
        'able to be trusted',
      ],
      examples: ['a reliable car', 'trustworthy analysis'],
      partOfSpeech: 'adjective',
      ipa: 'rɪˈlaɪəbl',
      number: 'singular',
    },
    phoneSearchItems: [
      {
        source: 'reliable',
        translation: 'надійний, достовірний',
        definitions: [
          'consistently good in quality or performance',
          'able to be trusted',
        ],
        examples: ['a reliable car', 'trustworthy analysis'],
        partOfSpeech: 'adjective',
        ipa: 'rɪˈlaɪəbl',
        number: 'singular',
        frequency: 7,
      },
      {
        source: 'dependable',
        translation: 'надійний, безвідмовний',
        definitions: ['capable of being relied on; trustworthy'],
        examples: ['a dependable friend', 'a dependable source'],
        partOfSpeech: 'adjective',
        ipa: 'dɪˈpɛndəbl',
        number: 'singular',
        frequency: 5,
      },
      {
        source: 'trustworthy',
        translation: 'надійний, довірливий',
        definitions: [
          'deserving of trust or confidence; dependable and reliable',
        ],
        examples: [
          'She is a trustworthy friend.',
          'A trustworthy source for information.',
        ],
        partOfSpeech: 'adjective',
        ipa: 'ˈtrʌstˌwɜːrði',
        number: 'singular',
        frequency: 6,
      },
      {
        source: 'secure',
        translation: 'безпечний, надійний',
        definitions: ['free from danger or threat', 'firmly fixed or fastened'],
        examples: ['a secure area', 'secure finances'],
        partOfSpeech: 'adjective',
        ipa: 'sɪˈkjʊr',
        number: 'singular',
        frequency: 7,
      },
    ],
    incorrectTranslations: [
      'швидкий, скорий',
      'дорогий, цінний',
      'крихкий, слабкий',
    ],
    learnButton: 'Вчити',
    grades: ['Ще ні', 'Майже', 'Знаю!'],
    revealHint: 'Натисніть для перекладу',
    example: 'Приклад:',
    translate: 'Перекладайте',
    translateSub: 'будь-які слова та фрази.',
    learn: 'Вчіть',
    learnSub: 'за допомогою тестів та інтерактивних запитань.',
    extension: 'Перекладайте та зберігайте',
    extensionSub: 'в один клік за допомогою розширення Safari для iOS.',
    cws: {
      save: [
        'Зберігайте *перекладені* слова',
        'ШІ-словник, у якому можна зберігати нові слова та фрази.',
      ],
      youtube: [
        'Натисніть на будь-яке слово в субтитрах *YouTube*',
        'Vocably перекладе слово й допоможе його вивчити.',
      ],
      calls: [
        '*Перекладайте* та *зберігайте* під час відеодзвінків',
        'Ідеально для тих, хто займається з онлайн-репетитором.',
      ],
      study: [
        '*Вчіть* їх *будь-де*',
        'Повторюйте збережені слова за методом інтервальних повторень на телефоні або в браузері.',
      ],
      phoneFeatures: [
        'Синхронізація між пристроями',
        'Якісний мобільний застосунок',
        'Словник, який завжди з вами',
      ],
      everywhere: [
        '*Перекладайте*, хоч би чим ви займалися',
        'Vocably — це екосистема для тих, хто активно користується іноземною мовою.',
      ],
      appStoreBadge: 'Завантажте в',
      googlePlayBadge: 'ДОСТУПНО В',
    },
    article: reliableArticle,
    subtitle: reliableSubtitle,
    pageText: reliablePage,
    androidExtension: 'Виділяйте, перекладайте та зберігайте',
    androidExtensionSub:
      'слова, переглядаючи сайти в будь-якому мобільному браузері.',
    webSearch: 'Пошук в Інтернеті',
    ebook: 'Натисніть на будь-яке слово, читаючи електронні книги.',
    ebookSub: 'Vocably інтегрується з більшістю читалок для Android.',
    done: 'Готово',
    desktopExtension: 'Читайте сайти та дивіться YouTube',
    desktopExtensionSub:
      'з розширенням Vocably для десктопних браузерів Chrome, Safari та Edge.',
    customLists: 'Створюйте власні списки карток',
    customListsSub: 'запитом до ШІ.',
    customListsPrompt: 'популярні дієслова',
    customListsCards: withTranslations([
      'досягати',
      'вирішувати',
      'покращувати',
      'пояснювати',
      'помічати',
      'уникати',
      'переконувати',
      'позичати',
      'прощати',
      'пропонувати',
    ]),
  },
  tr: {
    title: 'Bir dil öğrenme aracı.',
    iosHeaderTitle: 'Bir dil öğrenme aracı.',
    featureGraphicTitle:
      'Sözlük ve öğrenme sisteminin oldukça kaliteli bir birleşimi.',
    languageCount: '100+ dil.',
    search: 'güvenilir',
    sourceLanguage: 'en',
    searchItem: {
      source: 'reliable',
      translation: 'güvenilir, sağlam',
      definitions: [
        'consistently good in quality or performance',
        'able to be trusted',
      ],
      examples: ['a reliable car', 'trustworthy analysis'],
      partOfSpeech: 'adjective',
      ipa: 'rɪˈlaɪəbl',
      number: 'singular',
    },
    phoneSearchItems: [
      {
        source: 'reliable',
        translation: 'güvenilir, sağlam',
        definitions: [
          'consistently good in quality or performance',
          'able to be trusted',
        ],
        examples: ['a reliable car', 'trustworthy analysis'],
        partOfSpeech: 'adjective',
        ipa: 'rɪˈlaɪəbl',
        number: 'singular',
        frequency: 7,
      },
      {
        source: 'trustworthy',
        translation: 'güvenilir, emin, sağlam',
        definitions: [
          'deserving of trust or confidence; dependable and reliable',
        ],
        examples: [
          'She is a trustworthy friend.',
          'A trustworthy source for information.',
        ],
        partOfSpeech: 'adjective',
        ipa: 'ˈtrʌstˌwɜːrði',
        number: 'singular',
        frequency: 6,
      },
      {
        source: 'dependable',
        translation: 'güvenilir, sağlam',
        definitions: ['capable of being relied on; trustworthy'],
        examples: ['a dependable friend', 'a dependable source'],
        partOfSpeech: 'adjective',
        ipa: 'dɪˈpɛndəbl',
        number: 'singular',
        frequency: 5,
      },
      {
        source: 'credible',
        translation: 'güvenilir, inandırıcı',
        definitions: [
          'believable or trustworthy',
          'capable of being believed; plausible',
        ],
        examples: ['a credible witness', 'credible evidence'],
        partOfSpeech: 'adjective',
        ipa: 'ˈkrɛdɪbəl',
        number: 'singular',
        frequency: 6,
      },
    ],
    incorrectTranslations: [
      'hızlı, çabuk',
      'pahalı, değerli',
      'kırılgan, zayıf',
    ],
    learnButton: 'Öğren',
    grades: ['Henüz değil', 'Neredeyse', 'Biliyorum!'],
    revealHint: 'Çeviriyi görmek için dokun',
    example: 'Örnek:',
    translate: 'Çevirin',
    translateSub: 'her türlü kelime ve ifadeyi.',
    learn: 'Öğrenin',
    learnSub: 'testler ve etkileşimli sorularla.',
    extension: 'Çevirin ve kaydedin',
    extensionSub: 'iOS Safari Uzantısı ile tek tıkla.',
    cws: {
      save: [
        '*Çevrilen* kelimeleri kaydedin',
        'Yeni kelime ve ifadeleri kaydetmenizi sağlayan yapay zekâ destekli bir sözlük.',
      ],
      youtube: [
        '*YouTube* altyazılarındaki herhangi bir kelimeye tıklayın',
        'Vocably kelimeyi çevirir ve öğrenmenize yardımcı olur.',
      ],
      calls: [
        'Görüntülü görüşmelerde *çevirin* ve *kaydedin*',
        'Çevrim içi bir öğretmenle ders alan herkes için ideal.',
      ],
      study: [
        'Onları *her yerde* *çalışın*',
        'Kaydettiğiniz kelimeleri telefonunuzda veya tarayıcınızda aralıklı tekrarla gözden geçirin.',
      ],
      phoneFeatures: [
        'Cihazlar arasında senkronize',
        'Yüksek kaliteli mobil uygulama',
        'Her zaman yanınızda olan bir sözlük',
      ],
      everywhere: [
        'Ne yaparsanız yapın *çevirin*',
        'Vocably, yabancı bir dili aktif olarak kullananlar için tasarlanmış bir ekosistemdir.',
      ],
      appStoreBadge: 'Şimdi indirin',
      googlePlayBadge: 'ŞİMDİ EDİNİN',
    },
    article: reliableArticle,
    subtitle: reliableSubtitle,
    pageText: reliablePage,
    androidExtension: 'Kelimeleri seçin, çevirin ve kaydedin',
    androidExtensionSub: "herhangi bir mobil tarayıcıda web'de gezinirken.",
    webSearch: "Web'de ara",
    ebook: 'E-kitap okurken herhangi bir kelimeye basın.',
    ebookSub: 'Vocably, çoğu Android e-kitap okuyucusuyla entegre olur.',
    done: 'Tamam',
    desktopExtension: "Web'de gezinin ve YouTube izleyin",
    desktopExtensionSub:
      'Chrome, Safari ve Edge masaüstü tarayıcıları için Vocably uzantısıyla.',
    customLists: 'Özel kart listeleri oluşturun',
    customListsSub: 'yapay zekâya istem yazarak.',
    customListsPrompt: 'popüler fiiller',
    customListsCards: withTranslations([
      'başarmak',
      'karar vermek',
      'geliştirmek',
      'açıklamak',
      'fark etmek',
      'kaçınmak',
      'ikna etmek',
      'ödünç almak',
      'affetmek',
      'önermek',
    ]),
  },
  vi: {
    title: 'Công cụ học ngoại ngữ.',
    iosHeaderTitle: 'Công cụ học ngoại ngữ.',
    featureGraphicTitle:
      'Sự kết hợp khá chất lượng giữa từ điển và hệ thống học tập.',
    languageCount: 'Hơn 100 ngôn ngữ.',
    search: 'đáng tin cậy',
    sourceLanguage: 'en',
    searchItem: {
      source: 'reliable',
      translation: 'đáng tin cậy, tin cậy',
      definitions: [
        'consistently good in quality or performance',
        'able to be trusted',
      ],
      examples: ['a reliable car', 'trustworthy analysis'],
      partOfSpeech: 'adjective',
      ipa: 'rɪˈlaɪəbl',
      number: 'singular',
    },
    phoneSearchItems: [
      {
        source: 'reliable',
        translation: 'đáng tin cậy, tin cậy',
        definitions: [
          'consistently good in quality or performance',
          'able to be trusted',
        ],
        examples: ['a reliable car', 'trustworthy analysis'],
        partOfSpeech: 'adjective',
        ipa: 'rɪˈlaɪəbl',
        number: 'singular',
        frequency: 7,
      },
      {
        source: 'trustworthy',
        translation: 'đáng tin cậy, tin cậy, đáng tin',
        definitions: [
          'deserving of trust or confidence; dependable and reliable',
        ],
        examples: [
          'She is a trustworthy friend.',
          'A trustworthy source for information.',
        ],
        partOfSpeech: 'adjective',
        ipa: 'ˈtrʌstˌwɜːrði',
        number: 'singular',
        frequency: 6,
      },
      {
        source: 'dependable',
        translation: 'đáng tin cậy, đáng tin',
        definitions: ['capable of being relied on; trustworthy'],
        examples: ['a dependable friend', 'a dependable source'],
        partOfSpeech: 'adjective',
        ipa: 'dɪˈpɛndəbl',
        number: 'singular',
        frequency: 5,
      },
    ],
    incorrectTranslations: [
      'nhanh, nhanh chóng',
      'đắt, đắt tiền',
      'mong manh, yếu ớt',
    ],
    learnButton: 'Học',
    grades: ['Chưa biết', 'Gần đúng', 'Đã nhớ!'],
    revealHint: 'Chạm để xem bản dịch',
    example: 'Ví dụ:',
    translate: 'Dịch',
    translateSub: 'bất kỳ từ hoặc cụm từ nào.',
    learn: 'Học',
    learnSub: 'qua các bài kiểm tra và câu hỏi tương tác.',
    extension: 'Dịch và lưu',
    extensionSub: 'chỉ với một cú nhấp bằng Tiện ích mở rộng Safari trên iOS.',
    cws: {
      save: [
        'Lưu các từ *đã dịch*',
        'Từ điển AI giúp bạn lưu từ và cụm từ mới.',
      ],
      youtube: [
        'Nhấp vào bất kỳ từ nào trong phụ đề *YouTube*',
        'Vocably sẽ dịch từ đó và giúp bạn ghi nhớ.',
      ],
      calls: [
        '*Dịch* và *lưu* trong khi gọi video',
        'Lý tưởng cho những ai học cùng gia sư trực tuyến.',
      ],
      study: [
        '*Học* chúng ở *mọi nơi*',
        'Ôn lại các từ đã lưu bằng phương pháp lặp lại ngắt quãng trên điện thoại hoặc trình duyệt.',
      ],
      phoneFeatures: [
        'Đồng bộ giữa các thiết bị',
        'Ứng dụng di động chất lượng cao',
        'Một cuốn từ điển luôn ở bên bạn',
      ],
      everywhere: [
        '*Dịch* dù bạn đang làm gì',
        'Vocably là hệ sinh thái dành cho những ai thường xuyên sử dụng ngoại ngữ.',
      ],
      appStoreBadge: 'Tải về trên',
      googlePlayBadge: 'TẢI NỘI DUNG TRÊN',
    },
    article: reliableArticle,
    subtitle: reliableSubtitle,
    pageText: reliablePage,
    androidExtension: 'Chọn, dịch và lưu',
    androidExtensionSub: 'từ khi lướt web trên bất kỳ trình duyệt di động nào.',
    webSearch: 'Tìm kiếm trên web',
    ebook: 'Chạm vào từ bất kỳ khi đọc sách điện tử.',
    ebookSub:
      'Vocably tích hợp với hầu hết các ứng dụng đọc sách điện tử trên Android.',
    done: 'Xong',
    desktopExtension: 'Duyệt web và xem YouTube',
    desktopExtensionSub:
      'với tiện ích mở rộng Vocably cho trình duyệt máy tính Chrome, Safari và Edge.',
    customLists: 'Tạo danh sách thẻ tùy chỉnh',
    customListsSub: 'bằng cách gửi yêu cầu cho AI.',
    customListsPrompt: 'động từ phổ biến',
    customListsCards: withTranslations([
      'đạt được',
      'quyết định',
      'cải thiện',
      'giải thích',
      'nhận thấy',
      'tránh',
      'thuyết phục',
      'mượn',
      'tha thứ',
      'gợi ý',
    ]),
  },
  zh: {
    title: '一款语言学习工具。',
    iosHeaderTitle: '一款语言学习工具。',
    featureGraphicTitle: '词典与学习系统的出色结合。',
    languageCount: '支持 100 多种语言。',
    search: '可靠',
    sourceLanguage: 'en',
    searchItem: {
      source: 'reliable',
      translation: '可靠的，值得信赖的',
      definitions: [
        'consistently good in quality or performance',
        'able to be trusted',
      ],
      examples: ['a reliable car', 'trustworthy analysis'],
      partOfSpeech: 'adjective',
      ipa: 'rɪˈlaɪəbl',
      number: 'singular',
    },
    phoneSearchItems: [
      {
        source: 'reliable',
        translation: '可靠的, 可信赖的',
        definitions: [
          'consistently good in quality or performance',
          'able to be trusted',
        ],
        examples: ['a reliable car', 'trustworthy analysis'],
        partOfSpeech: 'adjective',
        ipa: 'rɪˈlaɪəbl',
        number: 'singular',
        frequency: 7,
      },
      {
        source: 'dependable',
        translation: '可靠的, 值得信赖的',
        definitions: ['capable of being relied on; trustworthy'],
        examples: ['a dependable friend', 'a dependable source'],
        partOfSpeech: 'adjective',
        ipa: 'dɪˈpɛndəbl',
        number: 'singular',
        frequency: 5,
      },
      {
        source: 'trustworthy',
        translation: '值得信赖, 可靠',
        definitions: [
          'deserving of trust or confidence; dependable and reliable',
        ],
        examples: [
          'She is a trustworthy friend.',
          'A trustworthy source for information.',
        ],
        partOfSpeech: 'adjective',
        ipa: 'ˈtrʌstˌwɜːrði',
        number: 'singular',
        frequency: 6,
      },
      {
        source: 'credible',
        translation: '可信的, 可靠的',
        definitions: [
          'believable or trustworthy',
          'capable of being believed; plausible',
        ],
        examples: ['a credible witness', 'credible evidence'],
        partOfSpeech: 'adjective',
        ipa: 'ˈkrɛdɪbəl',
        number: 'singular',
        frequency: 6,
      },
      {
        source: 'reliable',
        translation: '可靠的',
        ipa: '',
        definitions: [],
        examples: [],
      },
    ],
    incorrectTranslations: [
      '快速的，迅速的',
      '昂贵的，贵重的',
      '易碎的，脆弱的',
    ],
    learnButton: '学习',
    grades: ['还不会', '快会了', '会了！'],
    revealHint: '轻触查看翻译',
    example: '例句：',
    translate: '翻译',
    translateSub: '任何单词或短语。',
    learn: '学习',
    learnSub: '通过测验和互动问题。',
    extension: '翻译并保存',
    extensionSub: '只需一键，借助\niOS Safari 扩展程序即可完成。',
    cws: {
      save: ['保存*翻译过*的单词', '一款 AI 词典，帮你保存新单词和短语。'],
      youtube: [
        '点击 *YouTube* 字幕中的任意单词',
        'Vocably 会翻译这个单词，并帮你记住它。',
      ],
      calls: ['视频通话时也能*翻译*和*保存*', '非常适合跟着在线老师上课的人。'],
      study: ['随时随地*学习*', '在手机或浏览器上用间隔重复复习保存的单词。'],
      phoneFeatures: ['多设备同步', '高品质移动应用', '随身携带的词典'],
      everywhere: [
        '无论做什么，都能随时*翻译*',
        'Vocably 是专为积极使用外语的人打造的生态系统。',
      ],
      appStoreBadge: '下载于',
      googlePlayBadge: '立即获取',
    },
    article: reliableArticle,
    subtitle: reliableSubtitle,
    pageText: reliablePage,
    androidExtension: '选择、翻译并保存单词',
    androidExtensionSub: '在任意移动浏览器中\n浏览网页时即可使用。',
    webSearch: '网页搜索',
    ebook: '阅读电子书时，\n长按任意单词即可。',
    ebookSub: 'Vocably 支持大多数\nAndroid 电子书阅读器。',
    done: '完成',
    desktopExtension: '浏览网页、\n观看 YouTube',
    desktopExtensionSub:
      '使用适用于 Chrome、Safari\n和 Edge 桌面浏览器的\nVocably 扩展程序。',
    customLists: '生成自定义单词卡列表',
    customListsSub: '只需向 AI 发出请求。',
    customListsPrompt: '常用动词',
    customListsCards: withTranslations([
      '实现',
      '决定',
      '改进',
      '解释',
      '注意到',
      '避免',
      '说服',
      '借',
      '原谅',
      '建议',
    ]),
  },
  'zh-TW': {
    title: '一款語言學習工具。',
    iosHeaderTitle: '一款語言學習工具。',
    featureGraphicTitle: '字典與學習系統的絕佳結合。',
    languageCount: '支援 100 多種語言。',
    search: '可靠',
    sourceLanguage: 'en',
    searchItem: {
      source: 'reliable',
      translation: '可靠的，值得信賴的',
      definitions: [
        'consistently good in quality or performance',
        'able to be trusted',
      ],
      examples: ['a reliable car', 'trustworthy analysis'],
      partOfSpeech: 'adjective',
      ipa: 'rɪˈlaɪəbl',
      number: 'singular',
    },
    phoneSearchItems: [
      {
        source: 'reliable',
        translation: '可靠, 可信賴',
        definitions: [
          'consistently good in quality or performance',
          'able to be trusted',
        ],
        examples: ['a reliable car', 'trustworthy analysis'],
        partOfSpeech: 'adjective',
        ipa: 'rɪˈlaɪəbl',
        number: 'singular',
        frequency: 7,
      },
      {
        source: 'dependable',
        translation: '可靠的, 值得信賴的',
        definitions: ['capable of being relied on; trustworthy'],
        examples: ['a dependable friend', 'a dependable source'],
        partOfSpeech: 'adjective',
        ipa: 'dɪˈpɛndəbl',
        number: 'singular',
        frequency: 5,
      },
      {
        source: 'trustworthy',
        translation: '值得信賴, 可靠',
        definitions: [
          'deserving of trust or confidence; dependable and reliable',
        ],
        examples: [
          'She is a trustworthy friend.',
          'A trustworthy source for information.',
        ],
        partOfSpeech: 'adjective',
        ipa: 'ˈtrʌstˌwɜːrði',
        number: 'singular',
        frequency: 6,
      },
    ],
    incorrectTranslations: [
      '快速的，迅速的',
      '昂貴的，貴重的',
      '易碎的，脆弱的',
    ],
    learnButton: '學習',
    grades: ['還不會', '快會了', '會了！'],
    revealHint: '輕觸查看翻譯',
    example: '例句：',
    translate: '翻譯',
    translateSub: '任何單字或片語。',
    learn: '學習',
    learnSub: '透過測驗和互動式問題。',
    extension: '翻譯並儲存',
    extensionSub: '只要一鍵，透過\niOS Safari 擴充功能即可完成。',
    cws: {
      save: ['儲存*翻譯過*的單字', '一款 AI 字典，幫你儲存新單字和片語。'],
      youtube: [
        '點擊 *YouTube* 字幕中的任何單字',
        'Vocably 會翻譯這個單字，並幫你記住它。',
      ],
      calls: ['視訊通話時也能*翻譯*和*儲存*', '非常適合跟著線上老師上課的人。'],
      study: ['隨時隨地*學習*', '在手機或瀏覽器上用間隔重複複習儲存的單字。'],
      phoneFeatures: ['跨裝置同步', '高品質行動應用程式', '隨身攜帶的字典'],
      everywhere: [
        '無論做什麼，都能隨時*翻譯*',
        'Vocably 是專為積極使用外語的人打造的生態系統。',
      ],
      appStoreBadge: '下載於',
      googlePlayBadge: '立即取得',
    },
    article: reliableArticle,
    subtitle: reliableSubtitle,
    pageText: reliablePage,
    androidExtension: '選取、翻譯並儲存單字',
    androidExtensionSub: '在任何行動瀏覽器中\n瀏覽網頁時即可使用。',
    webSearch: '網頁搜尋',
    ebook: '閱讀電子書時，\n長按任何單字即可。',
    ebookSub: 'Vocably 支援大多數\nAndroid 電子書閱讀器。',
    done: '完成',
    desktopExtension: '瀏覽網頁、\n觀看 YouTube',
    desktopExtensionSub:
      '使用適用於 Chrome、Safari\n和 Edge 桌面瀏覽器的\nVocably 擴充功能。',
    customLists: '產生自訂單字卡清單',
    customListsSub: '只需向 AI 提出要求。',
    customListsPrompt: '常用動詞',
    customListsCards: withTranslations([
      '實現',
      '決定',
      '改善',
      '解釋',
      '注意到',
      '避免',
      '說服',
      '借',
      '原諒',
      '建議',
    ]),
  },
};
