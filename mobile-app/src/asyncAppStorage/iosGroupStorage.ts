import SharedGroupPreferences from 'react-native-shared-group-preferences';
import { isString } from 'lodash-es';

const appGroupStorageKey = 'app';
const appGroupId = 'group.vocably.app';

type AllGroupStorageValues = Record<string, string>;

export const getAllValues = async (): Promise<
  AllGroupStorageValues | undefined
> => {
  return SharedGroupPreferences.getItem(appGroupStorageKey, appGroupId)
    .then((values) => {
      return isString(values) ? JSON.parse(values) : undefined;
    })
    .catch((errorCode: 0 | 1) => {
      if (errorCode === 1) {
        return undefined;
      }
    });
};

// Do I need this?
export const clearAllValues = async () => {
  await SharedGroupPreferences.setItem(
    appGroupStorageKey,
    undefined,
    appGroupId
  );
};
