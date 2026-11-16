import { isRtlText } from './isRtlText';

describe('isRtlText', () => {
  it.each([
    ['Hebrew', 'שלום'],
    ['Arabic', 'مرحبا'],
    ['Persian', 'سلام'],
  ])('detects %s', (_, text) => {
    expect(isRtlText(text)).toBe(true);
  });

  it.each([
    ['Latin', 'hello'],
    ['Cyrillic', 'привет'],
    ['CJK', '你好'],
  ])('treats %s as left-to-right', (_, text) => {
    expect(isRtlText(text)).toBe(false);
  });

  it('skips leading digits, spaces and punctuation like dir="auto"', () => {
    expect(isRtlText('  12. «שלום»')).toBe(true);
    expect(isRtlText('— 3 hello')).toBe(false);
  });

  it('is decided by the first strongly directional character', () => {
    expect(isRtlText('שלום hello')).toBe(true);
    expect(isRtlText('hello שלום')).toBe(false);
  });

  it('falls back to left-to-right for text without letters', () => {
    expect(isRtlText('')).toBe(false);
    expect(isRtlText('123 !?')).toBe(false);
    expect(isRtlText()).toBe(false);
  });
});
