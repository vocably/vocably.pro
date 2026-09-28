import type { Language } from './languages';
import type { AnalysisItem, GoogleLanguage } from '@vocably/model';

type Translations = {
  // The headline of the first screenshot.
  title: string;
  // The headline of the Play feature graphic.
  featureGraphicTitle: string;
  // Shown under the flags of the first screenshot.
  languageCount: string;
  // The search field text of the second screenshot.
  search: string;
  sourceLanguage: GoogleLanguage;
  // The first item /analyze returns for `search`.
  searchItem: AnalysisItem;
  // Wrong answers for `searchItem` in the multi-choice study screenshot.
  incorrectTranslations: [string, string, string];
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

// The copy shown on the assets, per interface language.
export const localization: Record<Language, Translations> = {
  en: {
    title: 'A language-\nlearning tool.',
    featureGraphicTitle:
      'A pretty good combination of a dictionary and a learning system.',
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
    incorrectTranslations: ['luck', 'mystery', 'dream'],
    learnButton: 'Learn',
    example: 'Example:',
    translate: 'Translate',
    translateSub: 'any words or phrases.',
    learn: 'Learn',
    learnSub: 'with quizzes and\nother question types.',
    extension: 'Translate and save',
    extensionSub: 'with a single click using\nthe iOS Safari Extension.',
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
    incorrectTranslations: ['rápido, veloz', 'caro, costoso', 'frágil, débil'],
    learnButton: 'Aprender',
    example: 'Ejemplo:',
    translate: 'Traduce',
    translateSub: 'cualquier palabra o frase.',
    learn: 'Aprende',
    learnSub: 'con cuestionarios y otros tipos de preguntas.',
    extension: 'Traduce y guarda',
    extensionSub: 'con un solo clic usando la extensión de Safari para iOS.',
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
    incorrectTranslations: ['rápido, veloz', 'caro, custoso', 'frágil, fraco'],
    learnButton: 'Aprender',
    example: 'Exemplo:',
    translate: 'Traduza',
    translateSub: 'quaisquer palavras ou frases.',
    learn: 'Aprenda',
    learnSub: 'com testes e outros tipos de perguntas.',
    extension: 'Traduza e salve',
    extensionSub: 'com um único clique usando a extensão do Safari para iOS.',
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
    incorrectTranslations: [
      'быстрый, скорый',
      'дорогой, ценный',
      'хрупкий, слабый',
    ],
    learnButton: 'Учить',
    example: 'Пример:',
    translate: 'Переводите',
    translateSub: 'любые слова и фразы.',
    learn: 'Учите',
    learnSub: 'при помощи тестов и других типов вопросов.',
    extension: 'Переводите и сохраняйте',
    extensionSub: 'в один клик с помощью расширения Safari для iOS.',
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
    incorrectTranslations: [
      'швидкий, скорий',
      'дорогий, цінний',
      'крихкий, слабкий',
    ],
    learnButton: 'Вчити',
    example: 'Приклад:',
    translate: 'Перекладайте',
    translateSub: 'будь-які слова та фрази.',
    learn: 'Вчіть',
    learnSub: 'за допомогою тестів та інших типів запитань.',
    extension: 'Перекладайте та зберігайте',
    extensionSub: 'в один клік за допомогою розширення Safari для iOS.',
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
    incorrectTranslations: [
      'hızlı, çabuk',
      'pahalı, değerli',
      'kırılgan, zayıf',
    ],
    learnButton: 'Öğren',
    example: 'Örnek:',
    translate: 'Çevirin',
    translateSub: 'her türlü kelime ve ifadeyi.',
    learn: 'Öğrenin',
    learnSub: 'testler ve diğer soru türleriyle.',
    extension: 'Çevirin ve kaydedin',
    extensionSub: 'iOS Safari Uzantısı ile tek tıkla.',
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
    incorrectTranslations: [
      'nhanh, nhanh chóng',
      'đắt, đắt tiền',
      'mong manh, yếu ớt',
    ],
    learnButton: 'Học',
    example: 'Ví dụ:',
    translate: 'Dịch',
    translateSub: 'bất kỳ từ hoặc cụm từ nào.',
    learn: 'Học',
    learnSub: 'qua các bài kiểm tra và nhiều dạng câu hỏi khác.',
    extension: 'Dịch và lưu',
    extensionSub: 'chỉ với một cú nhấp bằng Tiện ích mở rộng Safari trên iOS.',
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
};
