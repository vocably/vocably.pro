import * as RNLocalize from 'react-native-localize';
import { getAppLocaleOverride } from './storage';
import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  SUPPORTED_LOCALE_CODES,
  SupportedLocale,
} from './supportedLocales';

/**
 * Synchronously resolves the initial UI locale:
 *   1. user override stored in MMKV (set via the App language picker), or
 *   2. best match between device locales and SUPPORTED_LOCALE_CODES, or
 *   3. DEFAULT_LOCALE.
 *
 * Kept separate from `src/getDeviceLanguage.ts` (which gates against
 * `GoogleLanguage`, the translation-target set — not the UI locale set).
 */
export const detectInitialLocale = (): SupportedLocale => {
  const override = getAppLocaleOverride();
  if (override) return override;

  const best = RNLocalize.findBestLanguageTag(
    SUPPORTED_LOCALE_CODES as unknown as string[]
  );
  if (best) {
    const two = best.languageTag.substring(0, 2);
    if (isSupportedLocale(two)) return two;
  }

  for (const loc of RNLocalize.getLocales()) {
    const two = loc.languageTag.substring(0, 2);
    if (isSupportedLocale(two)) return two;
  }

  return DEFAULT_LOCALE;
};
