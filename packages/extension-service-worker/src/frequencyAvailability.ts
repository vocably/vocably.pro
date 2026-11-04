import { browserEnv } from './browserEnv';

/**
 * Mirrors `mobile-app/src/useIsFrequencyAvailable.ts`: free users see word
 * frequency for FREE_FREQUENCY_MINUTES once every FREE_FREQUENCY_PERIOD_HOURS.
 * The time starts counting once a frequency is shown.
 */
const FREE_FREQUENCY_MINUTES = 15;
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

const readWindow = async (): Promise<FrequencyWindow | undefined> => {
  const { [STORAGE_KEY]: stored } = await browserEnv.storage.local.get([
    STORAGE_KEY,
  ]);

  return stored ?? undefined;
};

const toCurrentWindow = (startedAt: number): CurrentWindow => ({
  endsAt: startedAt + FREE_FREQUENCY_MS,
  resetsAt: startedAt + PERIOD_MS,
});

/**
 * The window of the current period, or undefined when it hasn't started yet.
 */
const getCurrentWindow = async (
  now: number
): Promise<CurrentWindow | undefined> => {
  const frequencyWindow = await readWindow();

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
const startWindow = async (now: number): Promise<CurrentWindow> => {
  const currentWindow = await getCurrentWindow(now);

  if (currentWindow) {
    return currentWindow;
  }

  await browserEnv.storage.local.set({
    [STORAGE_KEY]: { startedAt: now } satisfies FrequencyWindow,
  });

  return toCurrentWindow(now);
};

/**
 * Starts the free window if the period doesn't have one yet, and tells
 * whether a free user can see the frequency right now.
 */
export const changeFreeFrequencyAvailability = async (): Promise<boolean> => {
  const now = Date.now();
  const { endsAt } = await startWindow(now);

  return now < endsAt;
};
