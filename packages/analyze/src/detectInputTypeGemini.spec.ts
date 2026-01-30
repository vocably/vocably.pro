import '@vocably/jest';
import { inspect } from '@vocably/node-sulna';
import { detectInputTypeGemini } from './detectInputTypeGemini';
import { configureTestAnalyzer } from './test/configureTestAnalyzer';

configureTestAnalyzer();

describe('detectInputTypeGemini', () => {
  if (process.env.TEST_SKIP_SPEC === 'true') {
    it('skip spec testing', () => {});
    return;
  }

  it('sentence', async () => {
    const responseResult = await detectInputTypeGemini({
      language: 'en',
      source: 'Allice was beginning to get very tired of sitting',
    });

    console.log(inspect(responseResult));

    expect(responseResult.success).toEqual(true);
    if (responseResult.success === false) {
      return;
    }
    expect(responseResult.value.type).toEqual('sentence');
    expect(responseResult.value.isDirect).toEqual(true);
  });

  it('move on', async () => {
    const responseResult = await detectInputTypeGemini({
      language: 'en',
      source: 'move on',
    });

    console.log(inspect(responseResult));

    expect(responseResult.success).toEqual(true);
    if (responseResult.success === false) {
      return;
    }
    expect(responseResult.value.type).toEqual('phrasal verb');
    expect(responseResult.value.isDirect).toEqual(true);
  });

  it('idiom', async () => {
    const responseResult = await detectInputTypeGemini({
      language: 'en',
      source: 'bite the bullet',
    });

    console.log(inspect(responseResult));

    expect(responseResult.success).toEqual(true);
    if (responseResult.success === false) {
      return;
    }
    expect(responseResult.value.type).toEqual('idiom');
    expect(responseResult.value.isDirect).toEqual(true);
  });

  it('german idiom', async () => {
    const responseResult = await detectInputTypeGemini({
      language: 'de',
      source: 'In den sauren Apfel beißen',
    });

    console.log(inspect(responseResult));

    expect(responseResult.success).toEqual(true);
    if (responseResult.success === false) {
      return;
    }
    expect(responseResult.value.type).toEqual('idiom');
    expect(responseResult.value.isDirect).toEqual(true);
  });

  it('chinese word', async () => {
    const responseResult = await detectInputTypeGemini({
      language: 'zh',
      source: '有趣的',
    });

    expect(responseResult.success).toEqual(true);
    if (responseResult.success === false) {
      return;
    }
    expect(responseResult.value.type).toEqual('word');
    expect(responseResult.value.isDirect).toEqual(true);
  });

  it('chinese sentence', async () => {
    const responseResult = await detectInputTypeGemini({
      language: 'zh',
      source: '我叫杰克',
    });

    console.log(inspect(responseResult));

    expect(responseResult.success).toEqual(true);
    if (responseResult.success === false) {
      return;
    }
    expect(responseResult.value.type).toEqual('sentence');
    expect(responseResult.value.isDirect).toEqual(true);
  });

  it('riant', async () => {
    const responseResult = await detectInputTypeGemini({
      language: 'en',
      source: 'riant',
    });

    console.log(inspect(responseResult));

    expect(responseResult.success).toEqual(true);
    if (responseResult.success === false) {
      return;
    }
    expect(responseResult.value.type).toEqual('word');
    expect(responseResult.value.isDirect).toEqual(true);
  });

  it('is not direct', async () => {
    const responseResult = await detectInputTypeGemini({
      language: 'en',
      source: 'собака',
    });

    console.log(inspect(responseResult));

    expect(responseResult.success).toEqual(true);
    if (responseResult.success === false) {
      return;
    }
    expect(responseResult.value.type).toEqual('word');
    expect(responseResult.value.isDirect).toEqual(false);
  });

  it('compound word', async () => {
    const responseResult = await detectInputTypeGemini({
      language: 'ru',
      source: 'машинное масло',
    });

    console.log(inspect(responseResult));

    expect(responseResult.success).toEqual(true);
    if (responseResult.success === false) {
      return;
    }
    expect(responseResult.value.type).toEqual('compound word');
    expect(responseResult.value.isDirect).toEqual(true);
  });

  it('detects weird word (mismoedig)', async () => {
    const responseResult = await detectInputTypeGemini({
      language: 'nl',
      source: 'mismoedig',
    });

    console.log(inspect(responseResult));

    expect(responseResult.success).toEqual(true);
    if (responseResult.success === false) {
      return;
    }
    expect(responseResult.value.type).toEqual('word');
    expect(responseResult.value.isDirect).toEqual(true);
  });
});
