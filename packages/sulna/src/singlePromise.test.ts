import { singlePromise } from './singlePromise';

describe('singlePromise', () => {
  it('calls the underlying function once for concurrent calls', async () => {
    const fn = jest.fn().mockResolvedValue('result');
    const wrapped = singlePromise(fn);

    const [a, b] = await Promise.all([wrapped(), wrapped()]);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(a).toBe('result');
    expect(b).toBe('result');
  });

  it('returns the same promise for concurrent calls', () => {
    const fn = jest.fn().mockResolvedValue('result');
    const wrapped = singlePromise(fn);

    const p1 = wrapped();
    const p2 = wrapped();

    expect(p1).toBe(p2);
  });

  it('allows a new call after the promise resolves', async () => {
    const fn = jest.fn().mockResolvedValue('result');
    const wrapped = singlePromise(fn);

    await wrapped();
    await wrapped();

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('passes arguments to the underlying function', async () => {
    const fn = jest.fn((x: number) => Promise.resolve(x * 2));
    const wrapped = singlePromise(fn);

    const result = await wrapped(5);

    expect(result).toBe(10);
    expect(fn).toHaveBeenCalledWith(5);
  });
});
