import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './src/i18n/locales/en';

// The app's own `src/i18n` detects the device locale through a native module,
// so components under test get the same i18next setup with English resources.
void i18n.use(initReactI18next).init({
  lng: 'en',
  resources: { en: { translation: en } },
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v4',
  react: { useSuspense: false },
});

// `react-native-mmkv` keeps its data in memory when it runs under Jest
// (`createMockMMKV`), but it imports `react-native-nitro-modules` first, which
// installs itself through a native TurboModule at import time. Nitro skips
// that step when its proxy is already in `global`, so MMKV's in-memory mode
// can take over. Calling into the proxy (any real HybridObject) still fails.
(global as { NitroModulesProxy?: unknown }).NitroModulesProxy = {
  version: require('react-native-nitro-modules/package.json').version,
};
