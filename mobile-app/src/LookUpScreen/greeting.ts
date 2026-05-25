import { GoogleLanguage } from '@vocably/model';

export const greeting: Partial<
  Record<
    GoogleLanguage,
    {
      body: string;
      button: string;
    }
  >
> = {
  en: {
    body: `Hello to you too,

Vocably is a smart dictionary that lets you learn the words and phrases you translate.

It's perfect for anyone who uses a dictionary while learning a language.

Just for fun, try using Vocably next time you come across a new word or want to know how to say or write something in the language you're learning.

If you're only just starting to learn a language, try the flashcard generator. It will help you create a set of flashcards to study from.`,
    button: 'Flashcard generator',
  },
  es: {
    body: `Hola a ti también,

Vocably es un diccionario inteligente que te permite aprender las palabras y frases que traduces.

Es perfecto para quienes usan un diccionario mientras aprenden un idioma.

Por curiosidad, prueba a usar Vocably la próxima vez que te encuentres con una palabra nueva o quieras saber cómo decir o escribir algo en el idioma que estás aprendiendo.

Si apenas estás empezando a aprender un idioma, prueba el generador de tarjetas. Te ayudará a crear un conjunto de tarjetas para estudiar.`,
    button: 'Generador de tarjetas',
  },
  tr: {
    body: `Size de merhaba,

Vocably, çevirdiğiniz kelimeleri ve ifadeleri öğrenmenizi sağlayan akıllı bir sözlüktür.

Bir dil öğrenirken sözlük kullananlar için mükemmeldir.

Merak için, bir dahaki sefere yeni bir kelimeyle karşılaştığınızda ya da öğrendiğiniz dilde bir şeyi nasıl söyleyeceğinizi veya yazacağınızı öğrenmek istediğinizde Vocably'yi kullanmayı deneyin.

Eğer bir dili daha yeni öğrenmeye başlıyorsanız, kart oluşturucuyu deneyin. Çalışmak için bir kart seti oluşturmanıza yardımcı olacaktır.`,
    button: 'Kart oluşturucu',
  },
  vi: {
    body: `Chào bạn,

Vocably là một từ điển thông minh giúp bạn học những từ và cụm từ mà bạn đã dịch.

Nó rất phù hợp với những ai dùng từ điển khi học một ngôn ngữ.

Để cho vui, hãy thử dùng Vocably vào lần tới khi bạn gặp một từ mới hoặc muốn biết cách nói hay viết điều gì đó bằng ngôn ngữ bạn đang học.

Nếu bạn chỉ mới bắt đầu học một ngôn ngữ, hãy thử trình tạo thẻ. Nó sẽ giúp bạn tạo một bộ thẻ để học.`,
    button: 'Trình tạo thẻ',
  },
  zh: {
    body: `你好,

Vocably 是一款智能词典,可以帮助你学习翻译过的单词和短语。

它非常适合在学习语言时使用词典的人。

不妨试试看,下次当你遇到一个生词,或者想知道某句话在你正在学习的语言中怎么说、怎么写时,就用 Vocably 查一查。

如果你才刚开始学习一门语言,可以试试卡片生成器。它能帮你创建一套用于学习的卡片。`,
    button: '卡片生成器',
  },
  uk: {
    body: `І вам вітаю,

Вокаблі — це розумний словник із можливістю вивчати перекладені слова та фрази.

Він ідеально підходить для тих, хто користується словником під час вивчення мови.

Заради цікавості спробуйте скористатися Вокаблі наступного разу, коли натрапите на нове слово або захочете дізнатися, як щось сказати чи написати мовою, яку ви вивчаєте.

Якщо ви тільки починаєте вчити мову, спробуйте скористатися генератором карток. Він допоможе вам створити набір карток для навчання.`,
    button: 'Генератор карток',
  },
  'pt-PT': {
    body: `Olá para si também,

O Vocably é um dicionário inteligente que lhe permite aprender as palavras e frases que traduz.

É perfeito para quem usa um dicionário enquanto aprende uma língua.

Por curiosidade, experimente usar o Vocably da próxima vez que se deparar com uma palavra nova ou quiser saber como dizer ou escrever algo na língua que está a aprender.

Se está apenas a começar a aprender uma língua, experimente o gerador de cartões. Vai ajudá-lo a criar um conjunto de cartões para estudar.`,
    button: 'Gerador de cartões',
  },
  pt: {
    body: `Olá para você também,

O Vocably é um dicionário inteligente que permite aprender as palavras e frases que você traduz.

Ele é perfeito para quem usa um dicionário enquanto aprende um idioma.

Só por curiosidade, experimente usar o Vocably da próxima vez que encontrar uma palavra nova ou quiser saber como dizer ou escrever algo no idioma que você está aprendendo.

Se você está apenas começando a aprender um idioma, experimente o gerador de cartões. Ele vai ajudar você a criar um conjunto de cartões para estudar.`,
    button: 'Gerador de cartões',
  },
  ko: {
    body: `안녕하세요,

Vocably는 번역한 단어와 문장을 익힐 수 있는 똑똑한 사전입니다.

언어를 배우면서 사전을 사용하는 분들에게 안성맞춤입니다.

재미 삼아, 다음에 새로운 단어를 만나거나 배우고 있는 언어로 무언가를 어떻게 말하거나 쓰는지 알고 싶을 때 Vocably를 사용해 보세요.

이제 막 언어를 배우기 시작했다면, 카드 생성기를 사용해 보세요. 학습용 카드 세트를 만드는 데 도움이 됩니다.`,
    button: '카드 생성기',
  },
  ru: {
    body: `И вам здравствуйте,

Вокебли - это умный словарь с возможностью выучивать переведённые слова и фразы.

Он идеально подходит для тех кто пользуется словарём при изучении языка.

Ради интереса, попробуйте воспользоваться Вокебли в следующий раз когда вы встретите новое слово или захотите узнать как что-то сказать или написать на том языке, который вы учите.

Если вы только наичнаете учить язык, то попробуйте воспользоваться генератором карточек. Он поможет вам создать набор карточек для обучения.`,
    button: 'Генератор карточек',
  },
};
