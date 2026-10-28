#!/usr/bin/env -S npx vite-node

// Updates the localized App Store details of the iOS app.
//
//   ./scripts/update-app-store-details.mts [--dry-run]
//
// For every interface language in `details` it sets the name and subtitle on
// the editable app info, and the description, keywords and promotional text
// on the editable App Store version. Only the fields that differ from App
// Store Connect are sent. "What's New" is set by app-store-update-whats-new.mts.
//
// Needs an App Store Connect API key with the App Manager or Admin role:
// APP_STORE_CONNECT_API_KEY_KEY_ID, APP_STORE_CONNECT_API_KEY_ISSUER_ID and
// APP_STORE_CONNECT_API_KEY_KEY (the .p8 contents, base64 or PEM), read from
// the environment, scripts/.env.local or scripts/.env.

import { sign } from 'node:crypto';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const scriptsDir = dirname(fileURLToPath(import.meta.url));

// dotenv never overwrites a variable that is already set, so the environment
// wins over .env.local, which wins over .env.
dotenv.config({ path: `${scriptsDir}/.env.local`, quiet: true });
dotenv.config({ path: `${scriptsDir}/.env`, quiet: true });

type Details = {
  // App info, max 30 characters each.
  name: string;
  subtitle: string;
  // App Store version, max 4000 characters.
  description: string;
  // Comma-separated, max 100 characters. Words already in the name and
  // subtitle are indexed anyway, so there is no need to repeat them.
  keywords: string;
  // Max 170 characters. Can be changed without submitting a new version.
  promo: string;
};

const eula =
  'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';

const details: Record<string, Details> = {
  en: {
    name: 'Vocably: Dictionary Flashcards',
    subtitle: 'Translate and build vocabulary',
    description: `A dictionary focused on the needs of language learners.

Translate any word or phrase. Save your translations as high-quality flashcards. Memorize them with quizzes and questions.

What you can do with Vocably:

- Hear or see a word in real life: translate with the mobile app → save → learn
- Need to say something but don’t know the word? Search in your native language → save → learn
- Spot a new word on any website in iOS Safari: select → translate → save → learn
- Vocably also comes as a browser extension for your computer

Most of the flashcards created with Vocably will automatically contain:

- Part of speech
- Gender (when applicable)
- IPA / transcription
- Audio pronunciation
- Translations
- Definitions
- Usage examples

Study your flashcards with the Spaced Repetition System (SRS) - a proven method for effective study and retention of large amounts of information.

Mastering a language means using it and remembering every word. That's what Vocably is for.

Terms of Use (EULA): ${eula}`,
    keywords:
      'translator,english,german,spanish,french,italian,danish,dutch,norwegian,finnish,swedish,korean,greek',
    promo: '',
  },
  ru: {
    name: 'Vocably: словарь и карточки',
    subtitle: 'Перевод и обучение',
    description: `Словарь, созданный специально для людей, изучающих язык.

Переводите любые слова и фразы. Сохраняйте переводы в виде качественных карточек. Выучивайте свои сохранённые слова при помощью интерактивных тестов и вопросов.

Что можно делать с Vocably:

- Услышали или увидели слово в жизни: переведите в мобильном приложении → сохраните → выучите
- Нужно сказать что-то, а слова не знаете? Ищите на родном языке → сохраните → выучите
- Заметили новое слово на любом сайте в iOS Safari: выделите → переведите → сохраните → выучите
- Vocably также доступен как расширение для браузера на компьютере

Большинство карточек, созданных в Vocably, автоматически содержат:

- Часть речи
- Род (если применимо)
- Транскрипцию (IPA)
- Аудио произношение
- Переводы
- Определения
- Примеры употребления

Изучайте карточки с помощью системы интервальных повторений (SRS) — проверенного метода эффективного запоминания больших объёмов информации.

Владеть языком — значит использовать его в реальной жизни. Vocably создан специально чтобы помочь вам начать использовать язык и выучить каждое новое слово, встреченное на этом пути.

Условия использования (EULA): ${eula}`,
    keywords:
      'словарь,переводчик,обучение,английский,немецкий,французский,испанский,итальянский,голландский,слова',
    promo: '',
  },
  uk: {
    name: 'Vocably: словник і картки',
    subtitle: 'Переклад і вивчення слів',
    description: `Словник, створений спеціально для тих, хто вивчає мови.

Перекладайте будь-які слова та фрази. Зберігайте переклади у вигляді якісних карток. Запам'ятовуйте їх за допомогою тестів і запитань.

Що можна робити з Vocably:

- Почули чи побачили слово в житті: перекладіть у мобільному застосунку → збережіть → вивчіть
- Треба щось сказати, але не знаєте слова? Шукайте рідною мовою → збережіть → вивчіть
- Помітили нове слово на будь-якому сайті в iOS Safari: виділіть → перекладіть → збережіть → вивчіть
- Vocably також доступний як розширення для браузера на комп'ютері

Більшість карток, створених у Vocably, автоматично містять:

- Частину мови
- Рід (якщо застосовно)
- Транскрипцію (IPA)
- Аудіовимову
- Переклади
- Визначення
- Приклади вживання

Вивчайте картки за допомогою системи інтервальних повторень (SRS) — перевіреного методу ефективного запам'ятовування великих обсягів інформації.

Володіти мовою — означає користуватися нею й пам'ятати кожне слово. Саме для цього й існує Vocably.

Умови використання (EULA): ${eula}`,
    keywords:
      'перекладач,англійська,німецька,іспанська,французька,італійська,польська,слова,мови,навчання',
    promo: '',
  },
  es: {
    name: 'Vocably: diccionario y fichas',
    subtitle: 'Traduce y aprende vocabulario',
    description: `Un diccionario pensado para las necesidades de quienes aprenden idiomas.

Traduce cualquier palabra o frase. Guarda tus traducciones como fichas de alta calidad. Memorízalas con cuestionarios y preguntas.

Qué puedes hacer con Vocably:

- Oyes o ves una palabra en la vida real: tradúcela con la app → guárdala → apréndela
- ¿Necesitas decir algo pero no sabes la palabra? Búscala en tu idioma nativo → guárdala → apréndela
- Encuentras una palabra nueva en cualquier web en Safari de iOS: selecciónala → tradúcela → guárdala → apréndela
- Vocably también está disponible como extensión de navegador para tu ordenador

La mayoría de las fichas creadas con Vocably incluyen automáticamente:

- Categoría gramatical
- Género (cuando corresponde)
- AFI / transcripción
- Pronunciación en audio
- Traducciones
- Definiciones
- Ejemplos de uso

Estudia tus fichas con el Sistema de Repetición Espaciada (SRS), un método probado para estudiar y retener grandes cantidades de información de forma eficaz.

Dominar un idioma significa usarlo y recordar cada palabra. Para eso existe Vocably.

Condiciones de uso (EULA): ${eula}`,
    keywords:
      'traductor,inglés,alemán,francés,italiano,portugués,idiomas,palabras,aprender,tarjetas',
    promo: '',
  },
  pt: {
    name: 'Vocably: dicionário e cartões',
    subtitle: 'Traduza e aprenda vocabulário',
    description: `Um dicionário pensado nas necessidades de quem aprende idiomas.

Traduza qualquer palavra ou frase. Salve suas traduções como flashcards de alta qualidade. Memorize-as com quizzes e perguntas.

O que você pode fazer com o Vocably:

- Ouviu ou viu uma palavra no dia a dia: traduza com o app → salve → aprenda
- Precisa dizer algo, mas não sabe a palavra? Pesquise no seu idioma nativo → salve → aprenda
- Encontrou uma palavra nova em qualquer site no Safari do iOS: selecione → traduza → salve → aprenda
- O Vocably também está disponível como extensão de navegador para o seu computador

A maioria dos flashcards criados com o Vocably contém automaticamente:

- Classe gramatical
- Gênero (quando aplicável)
- AFI / transcrição
- Pronúncia em áudio
- Traduções
- Definições
- Exemplos de uso

Estude seus flashcards com o Sistema de Repetição Espaçada (SRS), um método comprovado para estudar e reter grandes quantidades de informação com eficiência.

Dominar um idioma significa usá-lo e lembrar de cada palavra. É para isso que o Vocably existe.

Termos de Uso (EULA): ${eula}`,
    keywords:
      'tradutor,inglês,espanhol,alemão,francês,italiano,idiomas,palavras,aprender,flashcards',
    promo: '',
  },
  tr: {
    name: 'Vocably: Sözlük ve Kartlar',
    subtitle: 'Çevir ve kelime öğren',
    description: `Dil öğrenenlerin ihtiyaçlarına odaklanan bir sözlük.

Herhangi bir kelimeyi veya ifadeyi çevirin. Çevirilerinizi yüksek kaliteli bilgi kartları olarak kaydedin. Testler ve sorularla ezberleyin.

Vocably ile neler yapabilirsiniz:

- Günlük hayatta bir kelime mi duydunuz ya da gördünüz? Mobil uygulamayla çevirin → kaydedin → öğrenin
- Bir şey söylemeniz gerekiyor ama kelimeyi bilmiyor musunuz? Ana dilinizde arayın → kaydedin → öğrenin
- iOS Safari'de herhangi bir sitede yeni bir kelime mi gördünüz? Seçin → çevirin → kaydedin → öğrenin
- Vocably, bilgisayarınız için tarayıcı uzantısı olarak da mevcut

Vocably ile oluşturulan kartların çoğu otomatik olarak şunları içerir:

- Sözcük türü
- Cinsiyet (varsa)
- IPA / transkripsiyon
- Sesli telaffuz
- Çeviriler
- Tanımlar
- Kullanım örnekleri

Kartlarınızı Aralıklı Tekrar Sistemi (SRS) ile çalışın: büyük miktarda bilgiyi etkili şekilde öğrenmek ve akılda tutmak için kanıtlanmış bir yöntem.

Bir dili öğrenmek, onu kullanmak ve her kelimeyi hatırlamak demektir. Vocably tam da bunun için var.

Kullanım Koşulları (EULA): ${eula}`,
    keywords:
      'çevirmen,ingilizce,almanca,ispanyolca,fransızca,italyanca,rusça,dil,öğrenme,flashcard',
    promo: '',
  },
  vi: {
    name: 'Vocably: Từ điển & Flashcard',
    subtitle: 'Dịch và học từ vựng',
    description: `Từ điển được thiết kế cho nhu cầu của người học ngoại ngữ.

Dịch bất kỳ từ hoặc cụm từ nào. Lưu bản dịch thành flashcard chất lượng cao. Ghi nhớ chúng qua các bài kiểm tra và câu hỏi.

Bạn có thể làm gì với Vocably:

- Nghe hoặc thấy một từ trong đời sống: dịch bằng ứng dụng → lưu → học
- Cần nói điều gì đó nhưng không biết từ? Tìm bằng tiếng mẹ đẻ → lưu → học
- Gặp từ mới trên bất kỳ trang web nào trong Safari trên iOS: chọn → dịch → lưu → học
- Vocably cũng có tiện ích mở rộng trình duyệt cho máy tính

Hầu hết flashcard tạo bằng Vocably tự động bao gồm:

- Từ loại
- Giống (nếu có)
- IPA / phiên âm
- Phát âm bằng âm thanh
- Bản dịch
- Định nghĩa
- Ví dụ sử dụng

Học flashcard với Hệ thống Lặp lại Ngắt quãng (SRS) - phương pháp đã được chứng minh giúp học và ghi nhớ hiệu quả lượng lớn thông tin.

Thành thạo một ngôn ngữ nghĩa là sử dụng nó và nhớ từng từ. Vocably ra đời vì điều đó.

Điều khoản sử dụng (EULA): ${eula}`,
    keywords:
      'tiếng anh,tiếng hàn,tiếng nhật,tiếng trung,tiếng pháp,tiếng đức,ngoại ngữ,từ mới,phát âm',
    promo: '',
  },
  zh: {
    name: 'Vocably：词典与单词卡',
    subtitle: '翻译并积累词汇',
    description: `一款专为语言学习者打造的词典。

翻译任意单词或短语。将翻译保存为高质量的单词卡。通过测验和问题牢记它们。

用 Vocably 可以做什么：

- 在生活中听到或看到一个单词：用移动应用翻译 → 保存 → 学习
- 想表达什么却不知道怎么说？用母语搜索 → 保存 → 学习
- 在 iOS Safari 的任意网站上发现新单词：选中 → 翻译 → 保存 → 学习
- Vocably 还提供适用于电脑的浏览器扩展程序

用 Vocably 创建的大多数单词卡会自动包含：

- 词性
- 性别（如适用）
- IPA 音标
- 语音发音
- 翻译
- 释义
- 例句

使用间隔重复系统（SRS）学习单词卡，这是一种经过验证的方法，能高效学习并记住大量信息。

掌握一门语言，意味着使用它并记住每一个单词。Vocably 正是为此而生。

使用条款（EULA）：${eula}`,
    keywords:
      '翻译,英语,日语,韩语,法语,德语,西班牙语,意大利语,俄语,背单词,外语,学习,发音,记忆卡',
    promo: '',
  },
  'zh-TW': {
    name: 'Vocably：字典與單字卡',
    subtitle: '翻譯並累積字彙',
    description: `一款專為語言學習者打造的字典。

翻譯任何單字或片語。將翻譯儲存為高品質的單字卡。透過測驗和問題牢記它們。

用 Vocably 可以做什麼：

- 在生活中聽到或看到一個單字：用行動應用程式翻譯 → 儲存 → 學習
- 想表達什麼卻不知道怎麼說？用母語搜尋 → 儲存 → 學習
- 在 iOS Safari 的任何網站上發現新單字：選取 → 翻譯 → 儲存 → 學習
- Vocably 也提供適用於電腦的瀏覽器擴充功能

用 Vocably 建立的大多數單字卡會自動包含：

- 詞性
- 性別（如適用）
- IPA 音標
- 語音發音
- 翻譯
- 釋義
- 例句

使用間隔重複系統（SRS）學習單字卡，這是一種經過驗證的方法，能有效學習並記住大量資訊。

掌握一門語言，代表使用它並記住每一個單字。Vocably 正是為此而生。

使用條款（EULA）：${eula}`,
    keywords:
      '翻譯,英文,日文,韓文,法文,德文,西班牙文,義大利文,俄文,背單字,外語,學習,發音,記憶卡',
    promo: '',
  },
};

// Interface language → App Store localizations it is written to.
const localeMap: Record<string, string[]> = {
  en: ['en-US'],
  ru: ['ru'],
  uk: ['uk'],
  es: ['es-ES'],
  pt: ['pt-BR'],
  tr: ['tr'],
  vi: ['vi'],
  zh: ['zh-Hans'],
  'zh-TW': ['zh-Hant'],
};

const limits: Record<keyof Details, number> = {
  name: 30,
  subtitle: 30,
  description: 4000,
  keywords: 100,
  promo: 170,
};

// App Store version states whose metadata can still be edited.
const editableVersionStates = [
  'PREPARE_FOR_SUBMISSION',
  'DEVELOPER_REJECTED',
  'REJECTED',
  'METADATA_REJECTED',
  'INVALID_BINARY',
];

// App info states whose name and subtitle can still be edited.
const editableAppInfoStates = [
  'PREPARE_FOR_SUBMISSION',
  'DEVELOPER_REJECTED',
  'REJECTED',
];

const dryRun = process.argv.includes('--dry-run');

const problems = Object.entries(details).flatMap(([language, fields]) => [
  ...(localeMap[language] ? [] : [`${language}: no App Store locale`]),
  ...(Object.keys(limits) as (keyof Details)[])
    .filter((field) => fields[field].trim() === '' && field !== 'promo')
    .map((field) => `${language}.${field} is empty`),
  ...(Object.entries(limits) as [keyof Details, number][])
    .filter(([field, limit]) => fields[field].length > limit)
    .map(
      ([field, limit]) =>
        `${language}.${field} is ${fields[field].length} characters, max ${limit}`
    ),
]);

if (problems.length > 0) {
  console.error(problems.join('\n'));
  process.exit(1);
}

const requireEnv = (name: string) => {
  const value = process.env[name];
  if (!value) {
    console.error(`${name} is not set.`);
    process.exit(1);
  }
  return value;
};

const keyId = requireEnv('APP_STORE_CONNECT_API_KEY_KEY_ID');
const issuerId = requireEnv('APP_STORE_CONNECT_API_KEY_ISSUER_ID');
const rawKey = requireEnv('APP_STORE_CONNECT_API_KEY_KEY');
const privateKey = rawKey.includes('BEGIN PRIVATE KEY')
  ? rawKey.replace(/\\n/g, '\n')
  : Buffer.from(rawKey, 'base64').toString('utf8');
const bundleId = 'pro.vocably.app';

let token: { value: string; expiresAt: number } | undefined;

const getToken = () => {
  const now = Math.floor(Date.now() / 1000);
  if (token && token.expiresAt - 60 > now) return token.value;

  const encode = (value: object) =>
    Buffer.from(JSON.stringify(value)).toString('base64url');
  const expiresAt = now + 15 * 60;
  const unsigned = `${encode({ alg: 'ES256', kid: keyId, typ: 'JWT' })}.${encode(
    { iss: issuerId, iat: now, exp: expiresAt, aud: 'appstoreconnect-v1' }
  )}`;
  const signature = sign('sha256', new TextEncoder().encode(unsigned), {
    key: privateKey,
    dsaEncoding: 'ieee-p1363',
  }).toString('base64url');

  token = { value: `${unsigned}.${signature}`, expiresAt };
  return token.value;
};

type Resource = {
  id: string;
  type: string;
  attributes: Record<string, any>;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const api = async <T = any,>(
  method: string,
  path: string,
  body?: object,
  attempt = 1
): Promise<T> => {
  const response = await fetch(`https://api.appstoreconnect.apple.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${getToken()}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  // App Store Connect answers with an occasional 500 that goes away on retry.
  if (response.status >= 500 && attempt < 5) {
    await sleep(attempt * 2000);
    return api(method, path, body, attempt + 1);
  }

  if (response.status === 403 && method !== 'GET') {
    throw new Error(
      `${method} ${path} is forbidden. The API key ${keyId} can't edit App Store metadata; use a key with the App Manager or Admin role.`
    );
  }

  if (!response.ok) {
    throw new Error(
      `${method} ${path} failed: ${response.status} ${await response.text()}`
    );
  }

  return response.status === 204 ? (undefined as T) : response.json();
};

// The attributes of `wanted` that differ from `current`.
const changes = (
  current: Record<string, any> | undefined,
  wanted: Record<string, string>
) =>
  Object.fromEntries(
    Object.entries(wanted).filter(
      ([key, value]) => (current?.[key] ?? '') !== value
    )
  );

const preview = (value: string) => {
  const line = value.replace(/\n/g, ' ⏎ ');
  return line.length > 80 ? `${line.slice(0, 77)}...` : line;
};

// Creates the localization when it is missing, otherwise patches the changed
// attributes. Returns true when it created one.
const save = async (
  label: string,
  type: string,
  existing: Resource | undefined,
  wanted: Record<string, string>,
  relationship: { name: string; type: string; id: string },
  locale: string
) => {
  const changed = changes(existing?.attributes, wanted);
  if (Object.keys(changed).length === 0) {
    console.log(`  ${label}: up to date`);
    return false;
  }

  console.log(`  ${label}: ${existing ? 'updating' : 'creating'}`);
  for (const [key, value] of Object.entries(changed)) {
    console.log(`    ${key}: ${preview(value)}`);
  }
  if (dryRun) return false;

  if (existing) {
    await api('PATCH', `/v1/${type}/${existing.id}`, {
      data: { type, id: existing.id, attributes: changed },
    });
  } else {
    await api('POST', `/v1/${type}`, {
      data: {
        type,
        attributes: { locale, ...wanted },
        relationships: {
          [relationship.name]: {
            data: { type: relationship.type, id: relationship.id },
          },
        },
      },
    });
  }
  return !existing;
};

const { data: apps } = await api<{ data: Resource[] }>(
  'GET',
  `/v1/apps?filter[bundleId]=${encodeURIComponent(bundleId)}`
);
const app = apps.find((a) => a.attributes.bundleId === bundleId);
if (!app) throw new Error(`App ${bundleId} not found.`);

const { data: appInfos } = await api<{ data: Resource[] }>(
  'GET',
  `/v1/apps/${app.id}/appInfos`
);
const appInfo = appInfos.find((info) =>
  editableAppInfoStates.includes(info.attributes.state)
);
if (!appInfo) {
  throw new Error(
    'There is no editable app info. Create a new App Store version in App Store Connect first.'
  );
}

const { data: versions } = await api<{ data: Resource[] }>(
  'GET',
  `/v1/apps/${app.id}/appStoreVersions?filter[platform]=IOS&filter[appStoreState]=${editableVersionStates.join(
    ','
  )}`
);
const version = versions[0];
if (!version) {
  throw new Error(
    'There is no editable iOS App Store version. Create one in App Store Connect first.'
  );
}
console.log(
  `${app.attributes.name} ${version.attributes.versionString} (${version.attributes.appStoreState})`
);

const { data: appInfoLocalizations } = await api<{ data: Resource[] }>(
  'GET',
  `/v1/appInfos/${appInfo.id}/appInfoLocalizations`
);
const getVersionLocalizations = async () =>
  (
    await api<{ data: Resource[] }>(
      'GET',
      `/v1/appStoreVersions/${version.id}/appStoreVersionLocalizations?limit=200`
    )
  ).data;
let versionLocalizations = await getVersionLocalizations();

for (const [language, fields] of Object.entries(details)) {
  for (const locale of localeMap[language]) {
    console.log(`${locale}:`);

    const appInfoCreated = await save(
      'name & subtitle',
      'appInfoLocalizations',
      appInfoLocalizations.find((l) => l.attributes.locale === locale),
      { name: fields.name, subtitle: fields.subtitle },
      { name: 'appInfo', type: 'appInfos', id: appInfo.id },
      locale
    );

    // Creating an app info localization makes App Store Connect create an
    // empty version localization for the same locale, so it has to be
    // patched rather than created.
    if (appInfoCreated) {
      versionLocalizations = await getVersionLocalizations();
    }

    await save(
      'description, keywords & promo',
      'appStoreVersionLocalizations',
      versionLocalizations.find((l) => l.attributes.locale === locale),
      {
        description: fields.description,
        keywords: fields.keywords,
        promotionalText: fields.promo,
      },
      {
        name: 'appStoreVersion',
        type: 'appStoreVersions',
        id: version.id,
      },
      locale
    );
  }
}

console.log(dryRun ? 'Dry run, nothing changed.' : 'Done.');
