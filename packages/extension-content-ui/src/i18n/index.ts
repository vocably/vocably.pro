import { translations } from './translations';
import { buildT } from '@vocably/browser-i18n';

export { subscribeToLocale, getLocale, setLocale } from '@vocably/browser-i18n';

export const t = buildT(translations);
