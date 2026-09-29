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
});
