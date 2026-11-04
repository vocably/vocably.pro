import { useEffect, useRef } from 'react';
import { mmkvStorage } from './mmkvStorage';

/**
 * Calls `refresh` whenever any of the given storage keys changes,
 * e.g. when a setting is updated on another screen.
 */
export const useRefreshOnStorageChange = (
  keys: string[],
  refresh: () => unknown
) => {
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;
  const keysString = keys.join('\n');

  useEffect(() => {
    const watchedKeys = keysString.split('\n');
    const listener = mmkvStorage.addOnValueChangedListener((changedKey) => {
      if (watchedKeys.includes(changedKey)) {
        refreshRef.current();
      }
    });

    return () => listener.remove();
  }, [keysString]);
};
