import { parseLocale } from '@vocably/model';
import * as RNLocalize from 'react-native-localize';
import { getAppLocaleOverride } from './storage';
import {
  DEFAULT_LOCALE,
  isSupportedLocale,
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

  for (const loc of RNLocalize.getLocales()) {
    const locale = parseLocale(loc.languageTag);
    if (isSupportedLocale(locale)) return locale;
  }

  return DEFAULT_LOCALE;
};
