import { PostHogCustomStorage } from 'posthog-react-native';
import { getItem, setItem } from './asyncAppStorage';

export const postHogCustomStorage: PostHogCustomStorage = {
  getItem: (key: string) => getItem(key).then((result) => result ?? null),
  setItem: setItem,
};
