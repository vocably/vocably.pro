type TrimArticleResult = {
  source: string;
};

const trimRegexes: Partial<Record<string, RegExp[]>> = {
  en: [/^(a)\s/i],
  nl: [/^(de|het|de.het|het.de)\s/i],
  de: [/^(der|die|das|ein|eine)\s/i],
  es: [/^(el|la|los|las|el.la|la.el)\s/i],
  fr: [/^(le|la|les|un|une|des|du|de)\s/i],
  it: [/^(il|lo|la|i|gli|le|un|uno|una)\s/i, /^(l)['’‘‛′ʼʹꞌ＇]/i],
  pt: [/^(o|a|os|as|um|uma|uns|umas)\s/i],
  no: [/^(en|ei|et)\s/i],
  da: [/^(en|et)\s/i],
};

export const trimArticle = (
  language: string,
  source: string
): TrimArticleResult => {
  if (trimRegexes[language] === undefined) {
    return {
      source,
    };
  }

  for (let regex of trimRegexes[language]) {
    const articleMatch = source.match(regex);

    if (articleMatch === null) {
      continue;
    }

    return {
      source: source.replace(regex, '').trim(),
    };
  }

  return {
    source,
  };
};

export const trimSenselessArticle = (
  language: string,
  source: string
): string => {
  if (language !== 'en') {
    return source;
  }

  return trimArticle(language, source).source;
};
