import { getUserMetadata } from '@vocably/api';
import { detectLocale } from '@vocably/browser-i18n';
import { isSuccess, Locale } from '@vocably/model';

export const resolveLocale = async (): Promise<Locale> => {
  try {
    const result = await getUserMetadata();
    if (isSuccess(result) && result.value.interfaceLanguage) {
      return result.value.interfaceLanguage;
    }
  } catch {}
  return detectLocale();
};
