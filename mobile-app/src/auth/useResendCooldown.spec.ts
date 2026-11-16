import { act, renderHook } from '@testing-library/react-native';
import { useResendCooldown } from './useResendCooldown';

// Every tick re-renders before the next one-second timer is armed,
// so the time has to pass one second at a time.
const passSeconds = async (seconds: number) => {
  for (let i = 0; i < seconds; i++) {
    await act(() => jest.advanceTimersByTime(1000));
  }
};

describe('useResendCooldown', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('is idle until started', async () => {
    const { result } = await renderHook(() => useResendCooldown(3));

    await passSeconds(5);

    expect(result.current.remaining).toBe(0);
  });

  it('counts down one second at a time and stops at zero', async () => {
    const { result } = await renderHook(() => useResendCooldown(3));

    await act(() => result.current.start());
    expect(result.current.remaining).toBe(3);

    await passSeconds(1);
    expect(result.current.remaining).toBe(2);

    await passSeconds(2);
    expect(result.current.remaining).toBe(0);

    await passSeconds(5);
    expect(result.current.remaining).toBe(0);
  });

  it('restarts the full cooldown when started again', async () => {
    const { result } = await renderHook(() => useResendCooldown(3));

    await act(() => result.current.start());
    await passSeconds(2);
    expect(result.current.remaining).toBe(1);

    await act(() => result.current.start());
    expect(result.current.remaining).toBe(3);
  });

  it('defaults to a minute, matching the Cognito throttling', async () => {
    const { result } = await renderHook(() => useResendCooldown());

    await act(() => result.current.start());

    expect(result.current.remaining).toBe(60);
  });
});
