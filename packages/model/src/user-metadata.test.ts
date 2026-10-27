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

  it('resolves Simplified Chinese tags', () => {
    expect(parseLocale('zh')).toEqual('zh');
    expect(parseLocale('zh-CN')).toEqual('zh');
    expect(parseLocale('zh_CN')).toEqual('zh');
    expect(parseLocale('zh-SG')).toEqual('zh');
    expect(parseLocale('zh-Hans')).toEqual('zh');
    expect(parseLocale('zh-Hans-CN')).toEqual('zh');
    expect(parseLocale('zh-Hans-TW')).toEqual('zh');
  });

  it('ignores unknown and empty values', () => {
    expect(parseLocale('kl')).toBeUndefined();
    expect(parseLocale('')).toBeUndefined();
    expect(parseLocale(undefined)).toBeUndefined();
  });
});
