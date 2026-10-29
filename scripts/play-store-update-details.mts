#!/usr/bin/env -S npx vite-node

// Updates the localized Google Play store listing of the Android app.
//
//   ./scripts/play-store-update-details.mts [--dry-run]
//
// For every interface language in `details` it sets the title, short
// description and full description of the store listing, creating the
// translation when the listing doesn't have it yet. Only the fields that
// differ from Google Play are sent. All changes go into one edit, which is
// committed at the end, so a failure leaves the store listing untouched.
// With managed publishing turned on in Play Console, committed changes wait
// on the "Publishing overview" page until they are sent for review there.
//
// Needs a Google Cloud service account that has access to the app in Play
// Console with the "Manage store presence" permission. Its JSON key (raw or
// base64) is read from GOOGLE_PLAY_SERVICE_ACCOUNT_KEY in the environment,
// scripts/.env.local or scripts/.env, falling back to the fastlane key at
// mobile-app/android/fastlane/secret/google-play.json.

import { sign } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const rootDir = dirname(scriptsDir);

// dotenv never overwrites a variable that is already set, so the environment
// wins over .env.local, which wins over .env.
dotenv.config({ path: `${scriptsDir}/.env.local`, quiet: true });
dotenv.config({ path: `${scriptsDir}/.env`, quiet: true });

type Details = {
  // Max 30 characters.
  title: string;
  // Max 80 characters.
  shortDescription: string;
  // Max 4000 characters.
  fullDescription: string;
};

// The text selection menu item is not translated, so it is quoted as is in
// every language.
const menuItem = 'Translate with Vocably';

const details: Record<string, Details> = {
  en: {
    title: 'Vocably: Dictionary Flashcards',
    shortDescription:
      'Translate any word or phrase and save them as flashcards. Grow your vocabulary.',
    fullDescription: `An AI dictionary that converts every translation into high-quality flashcards.

Supports English, Spanish, German, French, Italian, and 108 other languages.

What you can do with Vocably:

- Generate lists of flashcards with a prompt
- Hear or see a word in real life: translate with the mobile app → save → learn
- Need to say something but don’t know the word? Search in your native language → save → learn
- Spot a new word on any website or email: select → click ⠇-> ${menuItem} → save → learn
- Vocably also comes as a browser extension for your computer

Every flashcard created with Vocably contains:

- Part of speech
- Gender (when applicable)
- IPA / transcription
- Audio pronunciation
- Translations
- Definitions
- Usage examples

Study your flashcards with the Spaced Repetition System (SRS) - a proven method for effective study and retention of large amounts of information.

Mastering a language means using it and remembering every word. That's what Vocably is for.`,
  },
  ru: {
    title: 'Vocably: словарь и карточки',
    shortDescription: 'Переводите, сохраняйте и учите любые слова и фразы',
    fullDescription: `ИИ-словарь, который превращает переводы в качественные флеш-карточки.

Поддерживает английский, испанский, немецкий, французский, итальянский и ещё 108 языков.

Что можно делать с Vocably:

- Создавайте списки карточек по промпту
- Услышали или увидели слово в жизни: переведите в мобильном приложении → сохраните → учите
- Хотите что-то сказать, но не знаете нужное слово? Найдите его на родном языке → сохраните → учите
- Встретили новое слово на сайте или в письме: выделите его → нажмите ⠇ → «${menuItem}» → сохраните → учите

Vocably также доступен в виде расширения для браузера на компьютере.

Каждая карточка, созданная в Vocably, содержит:

- Часть речи
- Род (если применимо)
- Транскрипцию (IPA)
- Аудиопроизношение
- Переводы
- Определения
- Примеры использования

Изучайте свои карточки с помощью системы интервального повторения (SRS) — проверенного метода эффективного усвоения и запоминания больших объёмов информации.

Освоить язык — значит использовать его и запоминать каждое слово. Именно для этого создан Vocably.`,
  },
  uk: {
    title: 'Vocably: словник і картки',
    shortDescription:
      'Перекладайте, зберігайте й вивчайте будь-які слова та фрази',
    fullDescription: `ШІ-словник, який перетворює кожен переклад на якісні флешкартки.

Підтримує англійську, іспанську, німецьку, французьку, італійську та ще 108 мов.

Що можна робити з Vocably:

- Створюйте списки карток за промптом
- Почули чи побачили слово в житті: перекладіть у мобільному застосунку → збережіть → вивчіть
- Треба щось сказати, але не знаєте слова? Шукайте рідною мовою → збережіть → вивчіть
- Помітили нове слово на сайті чи в листі: виділіть його → натисніть ⠇ → «${menuItem}» → збережіть → вивчіть
- Vocably також доступний як розширення для браузера на комп'ютері

Кожна картка, створена у Vocably, містить:

- Частину мови
- Рід (якщо застосовно)
- Транскрипцію (IPA)
- Аудіовимову
- Переклади
- Визначення
- Приклади вживання

Вивчайте картки за допомогою системи інтервальних повторень (SRS) — перевіреного методу ефективного запам'ятовування великих обсягів інформації.

Володіти мовою — означає користуватися нею й пам'ятати кожне слово. Саме для цього й існує Vocably.`,
  },
  es: {
    title: 'Vocably: diccionario y fichas',
    shortDescription:
      'Traduce cualquier palabra o frase y guárdala como ficha. Amplía tu vocabulario.',
    fullDescription: `Un diccionario con IA que convierte cada traducción en fichas de alta calidad.

Compatible con inglés, español, alemán, francés, italiano y otros 108 idiomas.

Qué puedes hacer con Vocably:

- Genera listas de fichas a partir de una instrucción
- Oyes o ves una palabra en la vida real: tradúcela con la app → guárdala → apréndela
- ¿Necesitas decir algo pero no sabes la palabra? Búscala en tu idioma nativo → guárdala → apréndela
- Encuentras una palabra nueva en una web o un correo: selecciónala → toca ⠇ → «${menuItem}» → guárdala → apréndela
- Vocably también está disponible como extensión de navegador para tu ordenador

Cada ficha creada con Vocably incluye:

- Categoría gramatical
- Género (cuando corresponde)
- AFI / transcripción
- Pronunciación en audio
- Traducciones
- Definiciones
- Ejemplos de uso

Estudia tus fichas con el Sistema de Repetición Espaciada (SRS), un método probado para estudiar y retener grandes cantidades de información de forma eficaz.

Dominar un idioma significa usarlo y recordar cada palabra. Para eso existe Vocably.`,
  },
  pt: {
    title: 'Vocably: dicionário e cartões',
    shortDescription:
      'Traduza qualquer palavra ou frase e salve como flashcard. Amplie o vocabulário.',
    fullDescription: `Um dicionário com IA que transforma cada tradução em flashcards de alta qualidade.

Suporta inglês, espanhol, alemão, francês, italiano e mais 108 idiomas.

O que você pode fazer com o Vocably:

- Gere listas de flashcards a partir de um prompt
- Ouviu ou viu uma palavra no dia a dia: traduza com o app → salve → aprenda
- Precisa dizer algo, mas não sabe a palavra? Pesquise no seu idioma nativo → salve → aprenda
- Encontrou uma palavra nova em um site ou e-mail: selecione → toque em ⠇ → "${menuItem}" → salve → aprenda
- O Vocably também está disponível como extensão de navegador para o seu computador

Cada flashcard criado com o Vocably contém:

- Classe gramatical
- Gênero (quando aplicável)
- AFI / transcrição
- Pronúncia em áudio
- Traduções
- Definições
- Exemplos de uso

Estude seus flashcards com o Sistema de Repetição Espaçada (SRS), um método comprovado para estudar e reter grandes quantidades de informação com eficiência.

Dominar um idioma significa usá-lo e lembrar de cada palavra. É para isso que o Vocably existe.`,
  },
  tr: {
    title: 'Vocably: Sözlük ve Kartlar',
    shortDescription:
      'Kelime ve ifadeleri çevirin, kartlara kaydedin, kelime dağarcığınızı geliştirin',
    fullDescription: `Her çeviriyi yüksek kaliteli bilgi kartlarına dönüştüren yapay zekâ destekli bir sözlük.

İngilizce, İspanyolca, Almanca, Fransızca, İtalyanca ve 108 dili daha destekler.

Vocably ile neler yapabilirsiniz:

- Bir istemle kart listeleri oluşturun
- Günlük hayatta bir kelime mi duydunuz ya da gördünüz? Mobil uygulamayla çevirin → kaydedin → öğrenin
- Bir şey söylemeniz gerekiyor ama kelimeyi bilmiyor musunuz? Ana dilinizde arayın → kaydedin → öğrenin
- Bir sitede veya e-postada yeni bir kelime mi gördünüz? Seçin → ⠇ simgesine dokunun → "${menuItem}" → kaydedin → öğrenin
- Vocably, bilgisayarınız için tarayıcı uzantısı olarak da mevcut

Vocably ile oluşturulan her kart şunları içerir:

- Sözcük türü
- Cinsiyet (varsa)
- IPA / transkripsiyon
- Sesli telaffuz
- Çeviriler
- Tanımlar
- Kullanım örnekleri

Kartlarınızı Aralıklı Tekrar Sistemi (SRS) ile çalışın: büyük miktarda bilgiyi etkili şekilde öğrenmek ve akılda tutmak için kanıtlanmış bir yöntem.

Bir dili öğrenmek, onu kullanmak ve her kelimeyi hatırlamak demektir. Vocably tam da bunun için var.`,
  },
  vi: {
    title: 'Vocably: Từ điển & Flashcard',
    shortDescription:
      'Dịch mọi từ hoặc cụm từ, lưu thành flashcard và mở rộng vốn từ vựng của bạn',
    fullDescription: `Từ điển AI biến mỗi bản dịch thành flashcard chất lượng cao.

Hỗ trợ tiếng Anh, tiếng Tây Ban Nha, tiếng Đức, tiếng Pháp, tiếng Ý và 108 ngôn ngữ khác.

Bạn có thể làm gì với Vocably:

- Tạo danh sách flashcard chỉ bằng một câu lệnh
- Nghe hoặc thấy một từ trong đời sống: dịch bằng ứng dụng → lưu → học
- Cần nói điều gì đó nhưng không biết từ? Tìm bằng tiếng mẹ đẻ → lưu → học
- Gặp từ mới trên trang web hoặc email: chọn từ → nhấn ⠇ → "${menuItem}" → lưu → học
- Vocably cũng có tiện ích mở rộng trình duyệt cho máy tính

Mỗi flashcard tạo bằng Vocably đều bao gồm:

- Từ loại
- Giống (nếu có)
- IPA / phiên âm
- Phát âm bằng âm thanh
- Bản dịch
- Định nghĩa
- Ví dụ sử dụng

Học flashcard với Hệ thống Lặp lại Ngắt quãng (SRS) - phương pháp đã được chứng minh giúp học và ghi nhớ hiệu quả lượng lớn thông tin.

Thành thạo một ngôn ngữ nghĩa là sử dụng nó và nhớ từng từ. Vocably ra đời vì điều đó.`,
  },
  zh: {
    title: 'Vocably：词典与单词卡',
    shortDescription: '翻译任意单词或短语，保存为单词卡，扩充你的词汇量',
    fullDescription: `一款 AI 词典，能把每一次翻译都变成高质量的单词卡。

支持英语、西班牙语、德语、法语、意大利语等 113 种语言。

用 Vocably 可以做什么：

- 通过一句提示词生成单词卡列表
- 在生活中听到或看到一个单词：用移动应用翻译 → 保存 → 学习
- 想表达什么却不知道怎么说？用母语搜索 → 保存 → 学习
- 在网站或邮件中发现新单词：选中 → 点击 ⠇ → “${menuItem}” → 保存 → 学习
- Vocably 还提供适用于电脑的浏览器扩展程序

用 Vocably 创建的每张单词卡都包含：

- 词性
- 性别（如适用）
- IPA 音标
- 语音发音
- 翻译
- 释义
- 例句

使用间隔重复系统（SRS）学习单词卡，这是一种经过验证的方法，能高效学习并记住大量信息。

掌握一门语言，意味着使用它并记住每一个单词。Vocably 正是为此而生。`,
  },
  'zh-TW': {
    title: 'Vocably：字典與單字卡',
    shortDescription: '翻譯任何單字或片語，儲存為單字卡，累積你的字彙量',
    fullDescription: `一款 AI 字典，能把每一次翻譯都變成高品質的單字卡。

支援英文、西班牙文、德文、法文、義大利文等 113 種語言。

用 Vocably 可以做什麼：

- 透過一句提示詞產生單字卡清單
- 在生活中聽到或看到一個單字：用行動應用程式翻譯 → 儲存 → 學習
- 想表達什麼卻不知道怎麼說？用母語搜尋 → 儲存 → 學習
- 在網站或電子郵件中發現新單字：選取 → 點選 ⠇ → 「${menuItem}」 → 儲存 → 學習
- Vocably 也提供適用於電腦的瀏覽器擴充功能

用 Vocably 建立的每張單字卡都包含：

- 詞性
- 性別（如適用）
- IPA 音標
- 語音發音
- 翻譯
- 釋義
- 例句

使用間隔重複系統（SRS）學習單字卡，這是一種經過驗證的方法，能有效學習並記住大量資訊。

掌握一門語言，代表使用它並記住每一個單字。Vocably 正是為此而生。`,
  },
};

// Interface language → Google Play listing languages it is written to.
const localeMap: Record<string, string[]> = {
  en: ['en-US'],
  ru: ['ru-RU'],
  uk: ['uk'],
  es: ['es-ES'],
  pt: ['pt-BR'],
  tr: ['tr-TR'],
  vi: ['vi'],
  zh: ['zh-CN'],
  'zh-TW': ['zh-TW'],
};

const limits: Record<keyof Details, number> = {
  title: 30,
  shortDescription: 80,
  fullDescription: 4000,
};

const dryRun = process.argv.includes('--dry-run');

const problems = Object.entries(details).flatMap(([language, fields]) => [
  ...(localeMap[language] ? [] : [`${language}: no Google Play language`]),
  ...(Object.keys(limits) as (keyof Details)[])
    .filter((field) => fields[field].trim() === '')
    .map((field) => `${language}.${field} is empty`),
  ...(Object.entries(limits) as [keyof Details, number][])
    .filter(([field, limit]) => [...fields[field]].length > limit)
    .map(
      ([field, limit]) =>
        `${language}.${field} is ${
          [...fields[field]].length
        } characters, max ${limit}`
    ),
]);

if (problems.length > 0) {
  console.error(problems.join('\n'));
  process.exit(1);
}

const fastlaneKeyPath = `${rootDir}/mobile-app/android/fastlane/secret/google-play.json`;

const readServiceAccount = (): {
  client_email: string;
  private_key: string;
} => {
  const rawKey = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY;
  if (rawKey) {
    return JSON.parse(
      rawKey.trim().startsWith('{')
        ? rawKey
        : Buffer.from(rawKey, 'base64').toString('utf8')
    );
  }
  if (existsSync(fastlaneKeyPath)) {
    return JSON.parse(readFileSync(fastlaneKeyPath, 'utf8'));
  }
  console.error(
    `GOOGLE_PLAY_SERVICE_ACCOUNT_KEY is not set and ${fastlaneKeyPath} does not exist.`
  );
  process.exit(1);
};

const serviceAccount = readServiceAccount();
const packageName = 'com.vocablypro';

let token: { value: string; expiresAt: number } | undefined;

const getToken = async () => {
  const now = Math.floor(Date.now() / 1000);
  if (token && token.expiresAt - 60 > now) return token.value;

  const encode = (value: object) =>
    Buffer.from(JSON.stringify(value)).toString('base64url');
  const unsigned = `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode({
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/androidpublisher',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 60 * 60,
  })}`;
  const signature = sign(
    'sha256',
    new TextEncoder().encode(unsigned),
    serviceAccount.private_key
  ).toString('base64url');

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${unsigned}.${signature}`,
    }),
  });
  if (!response.ok) {
    throw new Error(
      `Getting a Google access token failed: ${response.status} ${await response.text()}`
    );
  }
  const { access_token, expires_in } = await response.json();

  token = { value: access_token, expiresAt: now + expires_in };
  return token.value;
};

const apiBase = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}`;

const api = async <T = any,>(
  method: string,
  url: string,
  body?: object
): Promise<T> => {
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${await getToken()}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 403 && method !== 'GET') {
    throw new Error(
      `${method} ${url} is forbidden. The service account ${serviceAccount.client_email} can't edit the store listing; give it the "Manage store presence" permission in Play Console.`
    );
  }

  if (!response.ok) {
    throw new Error(
      `${method} ${url} failed: ${response.status} ${await response.text()}`
    );
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
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

type Listing = Details & { language: string };

const { id: editId } = await api<{ id: string }>('POST', `${apiBase}/edits`);
const editBase = `${apiBase}/edits/${editId}`;
let committed = false;

try {
  const { listings = [] } = await api<{ listings?: Listing[] }>(
    'GET',
    `${editBase}/listings`
  );
  console.log(packageName);

  let changed = false;

  for (const [language, fields] of Object.entries(details)) {
    for (const locale of localeMap[language]) {
      const existing = listings.find((l) => l.language === locale);
      const diff = changes(existing, fields);

      if (Object.keys(diff).length === 0) {
        console.log(`${locale}: up to date`);
        continue;
      }

      console.log(`${locale}: ${existing ? 'updating' : 'creating'}`);
      for (const [key, value] of Object.entries(diff)) {
        console.log(`  ${key}: ${preview(value)}`);
      }
      changed = true;
      if (dryRun) continue;

      if (existing) {
        await api('PATCH', `${editBase}/listings/${locale}`, diff);
      } else {
        await api('PUT', `${editBase}/listings/${locale}`, {
          language: locale,
          ...fields,
        });
      }
    }
  }

  if (!dryRun && changed) {
    console.log('Committing the edit...');
    await api('POST', `${editBase}:commit`);
    committed = true;
  }
} finally {
  if (!committed) {
    await api('DELETE', editBase).catch((error) =>
      console.warn(`⚠️  Couldn't delete edit ${editId}: ${error.message}`)
    );
  }
}

console.log(
  dryRun
    ? 'Dry run, nothing changed.'
    : committed
      ? 'Done.'
      : 'Nothing to change.'
);
