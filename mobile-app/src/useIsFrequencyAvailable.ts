import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { mmkvStorage } from './mmkvStorage';
import { usePremiumStatus } from './usePremium';

// Free users see word frequency for this long once in a period.
const FREE_FREQUENCY_MINUTES = 10;
const FREE_FREQUENCY_PERIOD_HOURS = 4;
const FREE_FREQUENCY_MS = FREE_FREQUENCY_MINUTES * 60 * 1000;
const PERIOD_MS = FREE_FREQUENCY_PERIOD_HOURS * 60 * 60 * 1000;
const STORAGE_KEY = 'freeFrequencyWindow';

type FrequencyWindow = {
  startedAt: number;
};

type CurrentWindow = {
  // The frequency is shown until then.
  endsAt: number;
  // A new window can start from then on.
  resetsAt: number;
};

const readWindow = (): FrequencyWindow | undefined => {
  const stored = mmkvStorage.getString(STORAGE_KEY);

  if (!stored) {
    return undefined;
  }

  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error('Unable to parse the free frequency window', e);
    return undefined;
  }
};

const toCurrentWindow = (startedAt: number): CurrentWindow => ({
  endsAt: startedAt + FREE_FREQUENCY_MS,
  resetsAt: startedAt + PERIOD_MS,
});

/**
 * The window of the current period, or undefined when it hasn't started yet.
 */
const getCurrentWindow = (now: number): CurrentWindow | undefined => {
  const frequencyWindow = readWindow();

  if (
    !frequencyWindow ||
    typeof frequencyWindow.startedAt !== 'number' ||
    // A clock moved back shouldn't lock the frequency for long.
    frequencyWindow.startedAt > now
  ) {
    return undefined;
  }

  const currentWindow = toCurrentWindow(frequencyWindow.startedAt);

  return now < currentWindow.resetsAt ? currentWindow : undefined;
};

/**
 * Starts a window unless the current period already has one.
 */
const startWindow = (now: number): CurrentWindow => {
  const currentWindow = getCurrentWindow(now);

  if (currentWindow) {
    return currentWindow;
  }

  mmkvStorage.set(
    STORAGE_KEY,
    JSON.stringify({ startedAt: now } satisfies FrequencyWindow)
  );

  return toCurrentWindow(now);
};

/**
 * Free users see word frequency for FREE_FREQUENCY_MINUTES once every
 * FREE_FREQUENCY_PERIOD_HOURS. The time starts counting once a frequency is
 * shown.
 */
export const useIsFrequencyAvailable = (): boolean => {
  const premiumStatus = usePremiumStatus();
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    if (premiumStatus !== 'free') {
      return;
    }

    let timeout: ReturnType<typeof setTimeout> | undefined;

    const update = () => {
      clearTimeout(timeout);

      const currentTime = Date.now();
      const { endsAt, resetsAt } = startWindow(currentTime);
      setNow(currentTime);

      // Wakes up when the window ends, or when the period resets.
      timeout = setTimeout(
        update,
        (currentTime < endsAt ? endsAt : resetsAt) - currentTime
      );
    };

    update();

    // Timers don't run while the app is in the background.
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        update();
      }
    });

    return () => {
      clearTimeout(timeout);
      subscription.remove();
    };
  }, [premiumStatus]);

  if (premiumStatus !== 'free') {
    return true;
  }

  const currentWindow = getCurrentWindow(now);

  // An unstarted window starts as soon as the frequency is shown.
  return currentWindow === undefined || now < currentWindow.endsAt;
};
