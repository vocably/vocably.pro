import { parseLocale } from './user-metadata';

describe('parseLocale', () => {
  it('resolves plain and regional tags', () => {
    expect(parseLocale('ru')).toEqual('ru');
    expect(parseLocale('pt-BR')).toEqual('pt');
    expect(parseLocale('PT')).toEqual('pt');
    expect(parseLocale('uk_UA')).toEqual('uk');
  });

  it('resolves Traditional Chinese tags', () => {
    expect(parseLocale('zh-TW')).toEqual('zh-TW');
    expect(parseLocale('zh-HK')).toEqual('zh-TW');
    expect(parseLocale('zh-Hant')).toEqual('zh-TW');
    expect(parseLocale('zh-Hant-TW')).toEqual('zh-TW');
    expect(parseLocale('zh_TW')).toEqual('zh-TW');
  });

  it('ignores Simplified Chinese tags', () => {
    expect(parseLocale('zh')).toBeUndefined();
    expect(parseLocale('zh-CN')).toBeUndefined();
    expect(parseLocale('zh-Hans-CN')).toBeUndefined();
  });

  it('ignores unknown and empty values', () => {
    expect(parseLocale('kl')).toBeUndefined();
    expect(parseLocale('')).toBeUndefined();
    expect(parseLocale(undefined)).toBeUndefined();
  });
});
