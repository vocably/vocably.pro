import { languageList } from '@vocably/model';

const cache = new Map<string, string[]>();

const nativeName = (code: string): string | undefined => {
  try {
    // Intl.DisplayNames isn't in the es2017 lib this package compiles against.
    const DisplayNames = (Intl as any).DisplayNames;
    if (!DisplayNames) {
      return undefined;
    }
    const name: string | undefined = new DisplayNames([code], {
      type: 'language',
    }).of(code);
    return name && name.toLowerCase() !== code.toLowerCase() ? name : undefined;
  } catch {
    return undefined;
  }
};

/**
 * Strings a language can be found by besides its localized label:
 * the code, the English name and the name in the language itself.
 */
export const languageAliases = (code: string): string[] => {
  const cached = cache.get(code);
  if (cached) {
    return cached;
  }

  const aliases = [
    code,
    (languageList as Record<string, string>)[code],
    nativeName(code),
  ].filter((alias): alias is string => !!alias);

  cache.set(code, aliases);
  return aliases;
};
