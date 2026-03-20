import AsyncStorage from '@react-native-async-storage/async-storage';
import { PostHogCustomStorage } from 'posthog-react-native';

export const postHogCustomStorage: PostHogCustomStorage = {
  getItem: (key: string) => AsyncStorage.getItem(key),
  setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
};
