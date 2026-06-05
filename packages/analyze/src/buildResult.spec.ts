import '@vocably/jest';
import { isReverseAnalysis } from '@vocably/model';
import { uniq } from 'lodash-es';
import { buildResult } from './buildResult';
import { configureTestAnalyzer } from './test/configureTestAnalyzer';

configureTestAnalyzer();

const regelingInRussian = [
  'положение',
  'правило',
  'регулирование',
  'регулировка',
  'соглашение',
  'устройство',
  'положение',
  'схема',
  'договорённость',
  'договоренность',
  'норма',
];

describe('integration check for translate lambda', () => {
  if (process.env.TEST_SKIP_SPEC === 'true') {
    it('skip spec testing', () => {});
    return;
  }

  it('adds articles and takes translations from lexicala (nl)', async () => {
    const result = await buildResult({
      source: 'regeling',
      sourceLanguage: 'nl',
      targetLanguage: 'en',
    });

    expect(result.success).toBeTruthy();
    if (result.success === false) {
      return;
    }

    expect(result.value.source).toEqual('regeling');
    expect(result.value.translation).toBeDefined();
    expect(result.value.items[0].source).toEqual('de regeling');
    expect(result.value.items[0].translation).toHaveSomeOf(
      'regulation, arrangement, scheme, settlement, adjustment'
    );
  });

  it('adds articles and takes translations from lexicala (de)', async () => {
    const result = await buildResult({
      source: 'katzen',
      sourceLanguage: 'de',
      targetLanguage: 'en',
    });

    expect(result.success).toBeTruthy();
    if (result.success === false) {
      return;
    }

    expect(result.value.source).toEqual('katzen');
    expect(result.value.translation).toBeDefined();
    expect(result.value.items[0].source.toLowerCase()).toEqual('katzen');
    expect(result.value.items[0].translation).toEqual('cats, felines');
    expect(result.value.items[1].source).toEqual('die Katze');
    expect(result.value.items[1].translation).toEqual('cat, kitty, feline');
  });

  it('adds articles and takes translations from google', async () => {
    const result = await buildResult({
      source: 'regeling',
      sourceLanguage: 'nl',
      targetLanguage: 'ru',
    });

    expect(result.success).toBeTruthy();
    if (result.success === false) {
      return;
    }

    expect(result.value.source).toEqual('regeling');
    expect(result.value.translation).toBeDefined();
    expect(result.value.items[0].source).toEqual('de regeling');
    expect(result.value.items[0].translation).toHaveSomeOf(regelingInRussian);
  });

  it('trims article before analyzing', async () => {
    const result = await buildResult({
      source: 'de regeling',
      sourceLanguage: 'nl',
      targetLanguage: 'ru',
    });

    expect(result.success).toBeTruthy();
    if (result.success === false) {
      return;
    }

    expect(result.value.source).toEqual('de regeling');
    expect(result.value.translation).toBeDefined();
    expect(result.value.items[0].source).toEqual('de regeling');
    expect(result.value.items[0].translation).toHaveSomeOf(regelingInRussian);
  });

  it('skips analyze when source is more than one word', async () => {
    const result = await buildResult({
      source: 'vijf dagen',
      sourceLanguage: 'nl',
      targetLanguage: 'en',
    });

    expect(result.success).toBeTruthy();
    if (result.success === false) {
      return;
    }

    expect(result.value.source).toEqual('vijf dagen');
    expect(result.value.translation).toBeDefined();
    expect(result.value.translation.target).toEqual('five days');
    expect(result.value.items[0].source).toEqual('vijf dagen');
    expect(result.value.items[0].translation).toHaveSomeOf(
      'five days, 5 days, workweek, five-day period, five-day week'
    );
    expect(result.value.items[0].partOfSpeech).toHaveSomeOf(
      'noun phrase, phrase, noun'
    );
  });

  it('performs reverse analyze', async () => {
    const result = await buildResult({
      target: 'правило',
      sourceLanguage: 'nl',
      targetLanguage: 'ru',
    });

    expect(result.success).toBeTruthy();
    if (result.success === false) {
      return;
    }

    expect(isReverseAnalysis(result.value)).toBeTruthy();
    if (!isReverseAnalysis(result.value)) {
      return;
    }

    expect(result.value.target).toEqual('правило');
    expect(result.value.source).toEqual('regel');
    expect(result.value.translation).toBeDefined();
    expect(result.value.items[0].source).toEqual('de regel');
    expect(result.value.items[0].translation).toHaveSomeOf(regelingInRussian);
  });

  it('selects only one transcription', async () => {
    const result = await buildResult({
      source: 'hilarious',
      sourceLanguage: 'en',
      targetLanguage: 'ru',
    });

    expect(result.success).toBeTruthy();
    if (result.success === false) {
      return;
    }

    expect(result.value.translation).toBeDefined();
    expect(result.value.items[0].ipa).toBeDefined();
  });

  it('filters out senseless stuff that can not be translated', async () => {
    const result = await buildResult({
      source: 'wake',
      sourceLanguage: 'en',
      targetLanguage: 'en',
    });

    expect(result.success).toBeTruthy();
    if (result.success === false) {
      return;
    }

    expect(result.value.items.length).toEqual(2);
  });

  it('properly translates to non-article languages', async () => {
    const result = await buildResult({
      source: 'trick',
      sourceLanguage: 'en',
      targetLanguage: 'ru',
    });

    expect(result.success).toBeTruthy();
    if (result.success === false) {
      return;
    }

    expect(result.value.items.length).toBeGreaterThan(1);
    expect(result.value.items[0].translation).toHaveSomeOf(
      'трюк, прием, приём, уловка, фокус, хитрость'
    );
    expect(result.value.items[1].translation).toHaveSomeOf(
      'обманывать, одурачить, провести, перехитрить, обмануть, хитрить, надувать, проделывать, обмануть, проделать'
    );
  });

  it('properly translates dutch to non-article languages', async () => {
    const result = await buildResult({
      source: 'revalidatie',
      sourceLanguage: 'nl',
      targetLanguage: 'ru',
    });

    expect(result.success).toBeTruthy();
    if (result.success === false) {
      return;
    }

    expect(result.value.items.length).toEqual(1);
    expect(result.value.items[0].translation).toContain('реабилитация');
  });

  it('avoids duplicates in translations', async () => {
    const result = await buildResult({
      source: 'zijn',
      sourceLanguage: 'nl',
      targetLanguage: 'en',
    });

    expect(result.success).toBeTruthy();
    if (result.success === false) {
      return;
    }

    const translations = result.value.items[0].translation.split(', ');

    expect(translations.length).toBeGreaterThan(4);
    expect(translations.length).toEqual(uniq(translations).length);
  });

  it('adds romaji to IPA', async () => {
    const result = await buildResult({
      sourceLanguage: 'ja',
      targetLanguage: 'en',
      target: 'this is a message',
    });

    expect(result.success).toBeTruthy();
    if (result.success === false) {
      return;
    }

    expect(result.value.items[0].ipa).toHaveSomeOf([
      'kore wa messeeji desu',
      'koɾe wa messeːdʑi desu',
    ]);
    expect(result.value.items[0].translation.toLowerCase()).toEqual(
      'this is a message'
    );
  });

  it('provides romaji for ipa in japanese', async () => {
    const result = await buildResult({
      sourceLanguage: 'ja',
      targetLanguage: 'ru',
      source: '母親',
    });

    expect(result.success).toBeTruthy();
    if (result.success === false) {
      return;
    }

    expect(result.value.items[0].source).toEqual('母親');
    expect(result.value.items[0].translation).toHaveSomeOf('мать, мама');
    expect(result.value.items[0].partOfSpeech).toEqual('noun');
    expect(result.value.items[0].ipa).toEqual('hahaoya');
  });

  it('excludes similar words from translations', async () => {
    const result = await buildResult({
      sourceLanguage: 'ja',
      targetLanguage: 'ru',
      target: 'да',
    });

    expect(result.success).toBeTruthy();
    if (result.success === false) {
      return;
    }

    expect(result.value.items.length).toBeGreaterThanOrEqual(2);
    expect(result.value.items[0].translation.toLowerCase()).toHaveSomeOf(
      'да, угу, хорошо, ага, есть'
    );
  });

  it('performs the context translation', async () => {
    const result = await buildResult({
      sourceLanguage: 'en',
      targetLanguage: 'ru',
      source: 'bank',
      context:
        "Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, 'and what is the use of a book,' thought Alice 'without pictures or conversation?'",
    });

    expect(result.success).toBeTruthy();
    if (result.success === false) {
      return;
    }

    expect(result.value.source).toEqual('bank');
    expect(result.value.translation.target).toHaveSomeOf(['берег', 'берегу']);
  });

  it('performs the context translation (beginning)', async () => {
    const result = await buildResult({
      sourceLanguage: 'en',
      targetLanguage: 'ru',
      source: 'late',
      context: `There was nothing so very remarkable in that; nor did Alice think it so very much out of the way to hear the Rabbit say to itself, “Oh dear! Oh dear! I shall be late!” (when she thought it over afterwards, it occurred to her that she ought to have wondered at this, but at the time it all seemed quite natural); but when the Rabbit actually took a watch out of its waistcoat-pocket, and looked at it, and then hurried on, Alice started to her feet, for it flashed across her mind that she had never before seen a rabbit with either a waistcoat-pocket, or a watch to take out of it, and burning with curiosity, she ran across the field after it, and fortunately was just in time to see it pop down a large rabbit-hole under the hedge.'`,
    });

    expect(result.success).toBeTruthy();
    if (result.success === false) {
      return;
    }

    expect(result.value.translation.target).toHaveSomeOf([
      'опоздать',
      'поздно',
      'опоздавший',
      'поздний',
      'опаздывать',
    ]);
  });

  it('sort lexicala results by the context translation partOfSpeech', async () => {
    const result = await buildResult({
      sourceLanguage: 'en',
      targetLanguage: 'ru',
      source: 'groundbreaking',
      context: `Scientists have announced a groundbreaking discovery on Saturn's moon Titan: a new form of life that looks like algae.`,
    });

    expect(result.success).toBeTruthy();
    if (result.success === false) {
      return;
    }

    expect(result.value.translation.partOfSpeech).toEqual('adjective');
    expect(result.value.translation.target).toHaveSomeOf(
      'революционный, новаторский, новаторское'
    );
    expect(result.value.items[0].partOfSpeech).toEqual('adjective');
  });

  it('learn the language by using it', async () => {
    const result = await buildResult({
      sourceLanguage: 'en',
      targetLanguage: 'ru',
      source: 'Learn',
      context: `Learn the language by using it'`,
    });

    expect(result.success).toBeTruthy();
    if (result.success === false) {
      return;
    }

    expect(result.value.translation.target.toLowerCase()).toHaveSomeOf(
      'учите, учить'
    );
  });

  it('serbian', async () => {
    const result = await buildResult({
      sourceLanguage: 'sr',
      targetLanguage: 'ru',
      source: 'одржала',
      context: `НОВИ САД – Етно певачица Даница Црногорчевић одржала је у среду концерт на Великој сцени Српског народног позоришта, саопштио је`,
    });

    expect(result.success).toBeTruthy();
    if (result.success === false) {
      return;
    }

    expect(result.value.translation.target).toEqual('провела');
  });

  it('long serbian sentence', async () => {
    const result = await buildResult({
      sourceLanguage: 'sr',
      targetLanguage: 'ru',
      source:
        'ЂУРЂЕВ УПОЗОРИО Ако се настави демографска катаклизма, уз грађански рат који нам спремају, Срба у Србији више неће бити!',
      context: `ЂУРЂЕВ УПОЗОРИО Ако се настави демографска катаклизма, уз грађански рат који нам спремају, Срба у Србији више неће бити!`,
    });

    expect(result.success).toBeTruthy();
    if (result.success === false) {
      return;
    }

    expect(result.value.translation.target.length).toBeGreaterThan(110);
  });

  it('tailor - ru', async () => {
    const result = await buildResult({
      sourceLanguage: 'en',
      targetLanguage: 'ru',
      source: 'tailor',
    });

    expect(result.success).toBeTruthy();
    if (result.success === false) {
      return;
    }

    expect(result.value.items[0].partOfSpeech).toEqual('noun');
    expect(result.value.items[0].translation).toEqual(
      'портной, закройщик, швея'
    );

    expect(result.value.items[1].partOfSpeech).toEqual('verb');
    expect(result.value.items[1].translation).toContain(
      'адаптировать, приспосабливать, шить, сшить, подогнать'
    );
  });

  it('tailor - uk', async () => {
    const result = await buildResult({
      sourceLanguage: 'en',
      targetLanguage: 'uk',
      source: 'tailor',
    });

    expect(result.success).toBeTruthy();
    if (result.success === false) {
      return;
    }

    expect(result.value.items[0].partOfSpeech).toEqual('noun');
    expect(result.value.items[0].translation).toEqual(
      'кравець, кравчиня, швець'
    );

    expect(result.value.items[1].partOfSpeech).toEqual('verb');
    expect(result.value.items[1].translation).toHaveSomeOf(
      'пристосовувати, адаптувати, спеціалізувати, шити на замовлення, кравець'
    );
  });

  it('properly joins farsi definitions', async () => {
    const result = await buildResult({
      sourceLanguage: 'en',
      targetLanguage: 'fa',
      source: 'sister',
    });

    expect(result.success).toBeTruthy();
    if (result.success === false) {
      return;
    }

    expect(result.value.items[0].partOfSpeech).toEqual('noun');
    expect(result.value.items[0].translation).toHaveSomeOf([
      'خواهر, آبجی',
      'خواهر, همشیره, راهبه, خواهری',
    ]);
  });

  it('provides lexicala examples', async () => {
    const result = await buildResult({
      sourceLanguage: 'en',
      targetLanguage: 'ru',
      source: 'sister',
    });

    expect(result.success).toBeTruthy();
    if (result.success === false) {
      return;
    }

    expect(result.value.items[0].examples).toBeDefined();
    expect((result.value.items[0].examples ?? []).length).toBeGreaterThan(0);
  });

  it('provides ipa in result', async () => {
    const result = await buildResult({
      sourceLanguage: 'en',
      targetLanguage: 'ru',
      source: 'sister',
    });

    expect(result.success).toBeTruthy();
    if (result.success === false) {
      return;
    }

    expect(result.value.items[0].ipa).toEqual('ˈsɪstər');
  });

  it('zh - pinyin', async () => {
    const result = await buildResult({
      sourceLanguage: 'zh',
      targetLanguage: 'ru',
      source: '你好',
    });

    expect(result.success).toBeTruthy();
    if (result.success === false) {
      return;
    }

    expect(result.value.items[0].ipa).toEqual('nǐ hǎo');
    expect(result.value.items[0].translation.toLowerCase()).toHaveSomeOf(
      'здравствуйте, привет'
    );
  });

  it('provides context translation', async () => {
    const result = await buildResult({
      source: 'bank',
      sourceLanguage: 'en',
      targetLanguage: 'ru',
      context:
        "Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, 'and what is the use of a book,' thought Alice 'without pictures or conversation?'",
    });
    if (result.success === false) {
      throw 'Unexpected result';
    }
    expect(result.value.translation.target).toHaveSomeOf('берег, берегу');
  });

  it('sort: by part of speech', async () => {
    const result = await buildResult({
      source: 'peeped',
      sourceLanguage: 'en',
      targetLanguage: 'ru',
      context:
        "Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, 'and what is the use of a book,' thought Alice 'without pictures or conversation?'",
    });
    if (result.success === false) {
      throw 'Unexpected result';
    }

    expect(result.value.items[0].source).toEqual('peeped');
    expect(result.value.items[0].partOfSpeech).toEqual('verb');
    expect(result.value.items[1].source).toEqual('peep');
    expect(result.value.items[1].partOfSpeech).toEqual('verb');
  });

  it('sorts: put conversation before the conversion', async () => {
    const result = await buildResult({
      source: 'conversations',
      sourceLanguage: 'en',
      targetLanguage: 'ru',
      context:
        "Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, 'and what is the use of a book,' thought Alice 'without pictures or conversation?'",
    });
    if (result.success === false) {
      throw 'Unexpected result';
    }

    expect(result.value.items[0].source).toEqual('conversations');
    expect(result.value.items[0].partOfSpeech).toEqual('noun');
    expect(result.value.items[1].source).toEqual('conversation');
    expect(result.value.items[1].partOfSpeech).toEqual('noun');
  });

  it('removes similar items', async () => {
    const result = await buildResult({
      target: 'something',
      sourceLanguage: 'nl',
      targetLanguage: 'en',
    });
    if (result.success === false) {
      throw 'Unexpected result';
    }

    expect(result.value.items.length).toBeGreaterThanOrEqual(1);
    expect(result.value.items[0].source).toEqual('iets');
    expect(result.value.items[0].partOfSpeech).toEqual('pronoun');
  });

  it('removes "to" from english verbs', async () => {
    const result = await buildResult({
      target: 'идти',
      sourceLanguage: 'en',
      targetLanguage: 'ru',
    });
    if (result.success === false) {
      throw 'Unexpected result';
    }

    expect(result.value.items[0].source).not.toContain('to ');
  });

  it('keeps the punctuation for sentences', async () => {
    const result = await buildResult({
      source: 'Something, and something else.',
      sourceLanguage: 'en',
      targetLanguage: 'ru',
    });
    if (result.success === false) {
      throw 'Unexpected result';
    }

    expect(result.value.items[0].source).toEqual(
      'Something, and something else.'
    );
  });

  it('removes punctuation for single words', async () => {
    const result = await buildResult({
      source: 'something.',
      sourceLanguage: 'en',
      targetLanguage: 'ru',
    });
    if (result.success === false) {
      throw 'Unexpected result';
    }

    expect(result.value.items[0].source).toEqual('something');
  });

  it('uses lexicala to translate phrasal verbs', async () => {
    const result = await buildResult({
      source: 'get along',
      sourceLanguage: 'en',
      targetLanguage: 'ru',
    });
    if (result.success === false) {
      throw 'Unexpected result';
    }

    expect(result.value.items[0].source).toEqual('get along');
    expect(result.value.items[0].definitions.length).toBeGreaterThan(0);
  });

  it('non existing word', async () => {
    const result = await buildResult({
      source: 'mather',
      sourceLanguage: 'en',
      targetLanguage: 'ru',
    });
    if (result.success === false) {
      throw 'Unexpected result';
    }

    expect(result.value.items[0].source).toEqual('mother');
    expect(result.value.items[0].definitions.length).toEqual(0);
  });

  it('fixes diacritic marks', async () => {
    const result = await buildResult({
      source: 'frere',
      sourceLanguage: 'fr',
      targetLanguage: 'ru',
    });
    if (result.success === false) {
      throw 'Unexpected result';
    }

    expect(result.value.items[0].source).toEqual('frère');
    expect(result.value.items[0].definitions.length).toBeGreaterThan(0);
  });

  it('fixes spelling', async () => {
    const result = await buildResult({
      source: 'sissors',
      sourceLanguage: 'en',
      targetLanguage: 'uk',
    });
    if (result.success === false) {
      throw 'Unexpected result';
    }

    expect(result.value.items[0].source).toEqual('scissors');
    expect(result.value.items[0].translation).toEqual(
      'ножиці, ножиці для паперу, ножиці для тканини'
    );
    expect(result.value.items[0].definitions.length).toBeGreaterThan(0);
  });

  it('arrive in hindi', async () => {
    const result = await buildResult({
      source: 'आना',
      sourceLanguage: 'hi',
      targetLanguage: 'ru',
    });
    if (result.success === false) {
      throw 'Unexpected result';
    }

    expect(result.value.items.length).toBeGreaterThan(0);
  });

  it('question in hebrew', async () => {
    const result = await buildResult({
      source: 'שאלה',
      sourceLanguage: 'he',
      targetLanguage: 'en',
    });
    if (result.success === false) {
      throw 'Unexpected result';
    }

    expect(result.value.items.length).toBeGreaterThan(0);
    expect(result.value.items[0].source).toHaveSomeOf(['שאלה', 'שְׁאֵלָה']);
    expect(result.value.items[0].translation).toHaveSomeOf(
      'question, issue, wish, request, inquiry, query'
    );
    expect(result.value.items[0].definitions.length).toBeGreaterThan(0);
  });

  it('swahili', async () => {
    const result = await buildResult({
      target: 'table',
      sourceLanguage: 'sw',
      targetLanguage: 'en',
    });
    if (result.success === false) {
      throw 'Unexpected result';
    }

    expect(result.value.items.length).toBeGreaterThan(0);
    expect(result.value.items[0].source).toEqual('meza');
    expect(result.value.items[0].partOfSpeech).toEqual('noun');
    expect(result.value.items[0].translation).toEqual('table, desk');
  });

  it('norwegian cat', async () => {
    const result = await buildResult({
      sourceLanguage: 'no',
      targetLanguage: 'en',
      source: 'katt',
    });

    if (result.success === false) {
      throw 'Unexpected result';
    }

    expect(result.value.items[0].source).toEqual('en katt');
  });

  it('pinyin for chinese simplified', async () => {
    const result = await buildResult({
      sourceLanguage: 'zh',
      targetLanguage: 'en',
      source: '星期二',
    });

    if (result.success === false) {
      throw 'Unexpected result';
    }

    expect(result.value.items[0].ipa).toHaveSomeOf(["xīngqī'èr", 'xīngqī èr']);
  });

  it('pinyin for chinese traditional reverse translation', async () => {
    const result = await buildResult({
      sourceLanguage: 'zh',
      targetLanguage: 'en',
      target: 'Tuesday',
    });

    if (result.success === false) {
      throw 'Unexpected result';
    }

    expect(result.value.items[0].ipa).toHaveSomeOf([
      "xīngqī'èr",
      'xīngqī èr',
      'zhōu èr',
    ]);
  });

  it('translates from an arbitrary language and context into the direct and gives the proper source and target', async () => {
    const result = await buildResult({
      sourceLanguage: 'nl',
      targetLanguage: 'en',
      source: 'имя',
      context: 'Привет, какое у тебя имя?',
    });

    if (result.success === false) {
      throw 'Unexpected result';
    }

    expect(result.value.translation.source).toEqual('имя');
    expect(result.value.translation.target).toEqual('naam');
    expect(result.value.items[0].source).toEqual('de naam');
  });

  it('properly looks up in the same language', async () => {
    const result = await buildResult({
      sourceLanguage: 'en',
      targetLanguage: 'en',
      source: 'lesson',
    });

    if (result.success === false) {
      throw 'Unexpected result';
    }

    expect(result.value.items[0].source).toEqual('lesson');
    expect(result.value.items[0].partOfSpeech).toEqual('noun');
    expect(result.value.items[0].definitions.length).toBeGreaterThan(0);
    expect(result.value.items[0].examples?.length).toBeGreaterThan(0);
  });

  it('chair', async () => {
    const result = await buildResult({
      sourceLanguage: 'nl',
      targetLanguage: 'en',
      source: 'chair',
    });

    if (result.success === false) {
      throw 'Unexpected result';
    }

    expect(result.value.items[0].source).toEqual('de stoel');
    expect(result.value.items[0].partOfSpeech).toEqual('noun');
  });

  it('reverse translate into europen portuguese', async () => {
    const result = await buildResult({
      sourceLanguage: 'pt-PT',
      targetLanguage: 'en',
      target: 'train',
    });

    if (result.success === false) {
      throw 'Unexpected result';
    }

    expect(
      result.value.items.some(
        (i) => i.source === 'treinar' && i.partOfSpeech === 'verb'
      )
    ).toEqual(true);

    expect(
      result.value.items.some(
        (i) => i.source === 'comboio' && i.partOfSpeech === 'noun'
      )
    ).toEqual(true);
  });

  it('single unit of speech', async () => {
    const result = await buildResult({
      sourceLanguage: 'pt',
      targetLanguage: 'ru',
      target: 'португальцы глупые и ленивые',
    });

    if (result.success === false) {
      throw 'Unexpected result';
    }

    expect(
      result.value.items[0].source.split(' ').length
    ).toBeGreaterThanOrEqual(4);
  });

  it('великолепно', async () => {
    const result = await buildResult({
      sourceLanguage: 'en',
      targetLanguage: 'ru',
      source: 'великолепно',
    });

    if (result.success === false) {
      throw 'Unexpected result';
    }

    expect(result.value.items.length).toBeGreaterThanOrEqual(4);
  });

  it('trims de het', async () => {
    const result = await buildResult({
      sourceLanguage: 'nl',
      targetLanguage: 'en',
      source: 'de naam',
      context: 'Ze noemt de naam van het schip niet.',
    });

    if (result.success === false) {
      throw 'Unexpected result';
    }

    expect(result.value.items.some((i) => i.source === 'de naam')).toEqual(
      true
    );
    expect(result.value.items.some((i) => i.source === 'de de naam')).toEqual(
      false
    );
  });

  it('filters out nonsense', async () => {
    const result = await buildResult({
      sourceLanguage: 'en',
      targetLanguage: 'nl',
      source: 'employee',
    });

    if (result.success === false) {
      throw 'Unexpected result';
    }

    expect(result.value.items.length).toEqual(1);
    expect(result.value.items[0].source).toEqual('employee');
  });

  it('is infinitive and past tense', async () => {
    const result = await buildResult({
      sourceLanguage: 'sv',
      targetLanguage: 'en',
      source: 'utvärdera',
    });

    if (result.success === false) {
      throw 'Unexpected result';
    }

    expect(result.value.items.length).toEqual(1);
    expect(result.value.items[0].tense).toEqual('present');
    expect(result.value.items[0].pastTenses).toEqual(
      'utvärderade, har utvärderat'
    );
  });

  it('bypass gemini filters', async () => {
    const result = await buildResult({
      sourceLanguage: 'nl',
      targetLanguage: 'de',
      source: 'onderdompelen',
    });

    if (result.success === false) {
      throw 'Unexpected result';
    }

    expect(result.value.items.length).toBeGreaterThanOrEqual(1);
    expect(result.value.items[0].tense).toEqual('present');
  });

  it('question', async () => {
    const result = await buildResult({
      sourceLanguage: 'nl',
      targetLanguage: 'en',
      source: 'Geerda, can you give us the bed of Grover this time?',
    });

    if (result.success === false) {
      throw 'Unexpected result';
    }

    expect(result.value.items.length).toBeGreaterThanOrEqual(1);
    expect(result.value.detectedInputType).toEqual('sentence');
    expect(result.value.items[0].source).toEqual(
      'Geerda, kun je ons deze keer het bed van Grover geven?'
    );
    expect(result.value.items[0].translation).toEqual(
      'Geerda, can you give us the bed of Grover this time?'
    );
  });

  it('skips the thinking part for equal source and target languages', async () => {
    const result = await buildResult({
      sourceLanguage: 'en',
      targetLanguage: 'en',
      context:
        'On Tuesday, Mozilla announced a number of upcoming updates to Firefox',
      source: 'announced',
    });

    if (result.success === false) {
      throw 'Unexpected result';
    }

    expect(result.value.aiThinksItIs).toBeUndefined();
  });

  it('prioritizes language words', async () => {
    const result = await buildResult({
      sourceLanguage: 'de',
      targetLanguage: 'en',
      source: 'wider',
    });

    if (result.success === false) {
      throw 'Unexpected result';
    }

    console.log(result.value.items);

    expect(result.value.items.some((i) => i.source === 'wider')).toBeTruthy();
  });

  it('cat french', async () => {
    const result = await buildResult({
      sourceLanguage: 'fr',
      targetLanguage: 'en',
      source: 'cat',
    });

    if (result.success === false) {
      throw 'Unexpected result';
    }

    expect(result.value.items.some((i) => i.source === 'chat')).toBeTruthy();
  });

  it('dutch taille', async () => {
    const result = await buildResult({
      sourceLanguage: 'nl',
      targetLanguage: 'en',
      source: 'taille',
    });

    if (result.success === false) {
      throw 'Unexpected result';
    }

    expect(result.value.items[0].source).toEqual('de taille');
  });

  it('de pad', async () => {
    const result = await buildResult({
      sourceLanguage: 'nl',
      targetLanguage: 'en',
      source: 'de pad',
    });

    if (result.success === false) {
      throw 'Unexpected result';
    }

    expect(result.value.items[0].source).toEqual('de pad');
    expect(result.value.items[0].partOfSpeech).toEqual('noun');
  });

  it('grammar', async () => {
    const result = await buildResult({
      sourceLanguage: 'de',
      targetLanguage: 'en',
      source: 'grammar',
    });

    if (result.success === false) {
      throw 'Unexpected result';
    }

    expect(result.value.items[0].source).toEqual('die Grammatik');
    expect(result.value.items[0].partOfSpeech).toEqual('noun');
  });

  it('permanent employment in de', async () => {
    const result = await buildResult({
      sourceLanguage: 'de',
      targetLanguage: 'en',
      source: 'permanent employment',
    });

    if (result.success === false) {
      throw 'Unexpected result';
    }

    expect(result.value.items[0].partOfSpeech).toEqual('noun');
  });
});
