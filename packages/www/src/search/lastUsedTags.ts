const storageKey = 'lastUsedTagsIds';

/**
 * The website counterpart of the extension's `lastUsedTagsIds`, which keeps the
 * same list in `chrome.storage.local`.
 *
 * `localStorage` can be unavailable or throw (private windows, blocked site
 * data). A card added without inheriting the last used tags is a far better
 * outcome than an add that fails, so nothing here is allowed to throw.
 */
export const getLastUsedTagsIds = (): string[] => {
  try {
    const stored = localStorage.getItem(storageKey);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === 'string')
      : [];
  } catch (e) {
    return [];
  }
};

export const saveLastUsedTagsIds = (lastUsedTagsIds: string[]): void => {
  try {
    localStorage.setItem(storageKey, JSON.stringify(lastUsedTagsIds));
  } catch (e) {
    // Remembering the tags is a convenience, never a reason to fail the
    // operation that triggered the save.
  }
};
