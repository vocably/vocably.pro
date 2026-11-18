import { Platform, RateResponse, Result } from '@vocably/model';
import { browserEnv } from './browserEnv';
import { isSignedIn } from './session';
import { getUserMetadata, saveUserMetadata } from './userMetadata';

type RateResponses = Partial<Record<Platform, RateResponse>>;

const storage = browserEnv.storage.sync;
const storageKey = 'rateResponses';

const getStoredRateResponses = async (): Promise<RateResponses> => {
  const { [storageKey]: stored } = await storage.get([storageKey]);
  return stored ?? {};
};

const isNewer = (a: RateResponse, b: RateResponse | undefined): boolean =>
  b === undefined || a.isoDate > b.isoDate;

/**
 * Moves the responses collected while signed out (sync storage) into the
 * user metadata and clears sync storage once the metadata is saved.
 * A response already in the metadata wins when it is more recent.
 */
const migrateStoredRateResponses = async (): Promise<Result<RateResponses>> => {
  const metadataResult = await getUserMetadata();

  if (metadataResult.success === false) {
    return metadataResult;
  }

  const metadataRate: RateResponses = { ...metadataResult.value.rate };
  const stored = await getStoredRateResponses();
  const toBeSaved: RateResponses = {};

  for (const [platform, response] of Object.entries(stored) as [
    Platform,
    RateResponse,
  ][]) {
    if (isNewer(response, metadataRate[platform])) {
      toBeSaved[platform] = response;
      metadataRate[platform] = response;
    }
  }

  if (Object.keys(toBeSaved).length > 0) {
    const saveResult = await saveUserMetadata({ rate: toBeSaved });

    if (saveResult.success === false) {
      return saveResult;
    }
  }

  if (Object.keys(stored).length > 0) {
    await storage.remove(storageKey);
  }

  return { success: true, value: metadataRate };
};

export const getRateResponse = async (
  platform: Platform
): Promise<RateResponse | undefined> => {
  if (await isSignedIn()) {
    const migrationResult = await migrateStoredRateResponses();

    if (migrationResult.success) {
      return migrationResult.value[platform];
    }
  }

  // Signed out, or the metadata is unreachable: rely on sync storage.
  return (await getStoredRateResponses())[platform];
};

export const saveRateResponse = async (
  platform: Platform,
  response: RateResponse
): Promise<void> => {
  await storage.set({
    [storageKey]: {
      ...(await getStoredRateResponses()),
      [platform]: response,
    },
  });

  if (await isSignedIn()) {
    // Copies the response to the metadata and clears sync storage on success.
    await migrateStoredRateResponses();
  }
};
