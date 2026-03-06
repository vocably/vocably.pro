const LOCALE_KEY = '__vocably_locale__';
const WATCHERS_KEY = '__vocably_locale_watchers__';

export const setStencilLocale = (locale: string) => {
  (window as any)[LOCALE_KEY] = locale;
  const watchers = (window as any)[WATCHERS_KEY] as
    | Map<Element, () => void>
    | undefined;
  watchers?.forEach((fn) => {
    try {
      fn();
    } catch {}
  });
};
