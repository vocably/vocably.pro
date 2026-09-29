import '@vocably/jest';
import { inspect } from '@vocably/node-sulna';
import { detectInputTypeJev } from './detectInputTypeJev';
import { configureTestAnalyzer } from './test/configureTestAnalyzer';

configureTestAnalyzer();

describe('detectInputTypeJev', () => {
  if (process.env.TEST_SKIP_SPEC === 'true') {
    it('skip spec testing', () => {});
    return;
  }

  it('sentence', async () => {
    const responseResult = await detectInputTypeJev({
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
    const responseResult = await detectInputTypeJev({
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
    const responseResult = await detectInputTypeJev({
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
    const responseResult = await detectInputTypeJev({
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
    const responseResult = await detectInputTypeJev({
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
    const responseResult = await detectInputTypeJev({
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
    const responseResult = await detectInputTypeJev({
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
    const responseResult = await detectInputTypeJev({
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
    const responseResult = await detectInputTypeJev({
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
    const responseResult = await detectInputTypeJev({
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

  it('detects a rare german word a german', async () => {
    const responseResult = await detectInputTypeJev({
      language: 'de',
      source: 'wider',
    });

    console.log(inspect(responseResult));

    expect(responseResult.success).toEqual(true);
    if (responseResult.success === false) {
      return;
    }
    expect(responseResult.value.type).toEqual('word');
    expect(responseResult.value.isDirect).toEqual(true);
  });

  it('dutch false friend', async () => {
    const responseResult = await detectInputTypeJev({
      language: 'nl',
      source: 'gift',
    });

    console.log(inspect(responseResult));

    expect(responseResult.success).toEqual(true);
    if (responseResult.success === false) {
      return;
    }
    expect(responseResult.value.type).toEqual('word');
    expect(responseResult.value.isDirect).toEqual(true);
  });

  it('dutch taille', async () => {
    const responseResult = await detectInputTypeJev({
      language: 'nl',
      source: 'taille',
    });

    console.log(inspect(responseResult));

    expect(responseResult.success).toEqual(true);
    if (responseResult.success === false) {
      return;
    }
    expect(responseResult.value.type).toEqual('word');
    expect(responseResult.value.isDirect).toEqual(true);
  });

  it('chair nl', async () => {
    const responseResult = await detectInputTypeJev({
      language: 'nl',
      source: 'chair',
    });

    console.log(inspect(responseResult));

    expect(responseResult.success).toEqual(true);
    if (responseResult.success === false) {
      return;
    }
    expect(responseResult.value.type).toEqual('word');
    expect(responseResult.value.isDirect).toEqual(false);
  });

  it('german grammar', async () => {
    const responseResult = await detectInputTypeJev({
      language: 'de',
      source: 'grammar',
    });

    console.log(inspect(responseResult));

    expect(responseResult.success).toEqual(true);
    if (responseResult.success === false) {
      return;
    }
    expect(responseResult.value.type).toEqual('word');
    expect(responseResult.value.isDirect).toEqual(false);
  });

  it('dutch table', async () => {
    const responseResult = await detectInputTypeJev({
      language: 'nl',
      source: 'table',
    });

    console.log(inspect(responseResult));

    expect(responseResult.success).toEqual(true);
    if (responseResult.success === false) {
      return;
    }
    expect(responseResult.value.type).toEqual('word');
    expect(responseResult.value.isDirect).toEqual(false);
  });

  it('german bay', async () => {
    const responseResult = await detectInputTypeJev({
      language: 'de',
      source: 'bay',
    });

    console.log(inspect(responseResult));

    expect(responseResult.success).toEqual(true);
    if (responseResult.success === false) {
      return;
    }
    expect(responseResult.value.type).toEqual('word');
    expect(responseResult.value.isDirect).toEqual(false);
  });

  it('creeren nl', async () => {
    const responseResult = await detectInputTypeJev({
      language: 'nl',
      source: 'creeren',
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
