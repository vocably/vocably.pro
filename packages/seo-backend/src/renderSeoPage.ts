import { renderToString } from '@vocably/extension-content-ui/hydrate';
import { AnalysisItem, languageList, TranslationCards } from '@vocably/model';
import {
  cardToLocationHash,
  getSeoPageName,
  getSeoPagePath,
  SeoLanguagePair,
} from '@vocably/model-operations';
import {
  htmlSpecialChars,
  join as joinDefinitions,
  trimLanguage,
} from '@vocably/sulna';
import { createHash } from 'node:crypto';

// Canonical URLs always point to production, as they did when the pages were
// generated at build time. Non-prod hosts are kept out of the index by the
// X-Robots-Tag header set in CloudFront.
export const canonicalBaseUrl = 'https://vocably.pro';

/** The page rendered by packages/www that the SEO pages are built from. */
export const templateFileName = 'search.html';

const escapeRegExp = (str: string): string =>
  str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const replaceExpressions = {
  canonical: new RegExp(
    `<link rel="canonical" href="${escapeRegExp(
      `${canonicalBaseUrl}/${templateFileName}`
    )}".*?>`,
    'mi'
  ),
  container: new RegExp(escapeRegExp('<div id="search"></div>'), 'mi'),
  description: new RegExp(`<meta name="description".*?>`, 'mi'),
  ogDescription: new RegExp(`<meta property="og:description".*?>`, 'mi'),
  ogTitle: new RegExp(`<meta property="og:title".*?>`, 'mi'),
  ogUrl: new RegExp(`<meta property="og:url".*?>`, 'mi'),
  repoLink: new RegExp(
    `id="repo-link" href="https://github.com/vocably"`,
    'mi'
  ),
};

/** Throws when the template lacks a block the SEO page depends on. */
export const assertValidTemplate = (templateHtml: string) => {
  for (const [name, expression] of Object.entries(replaceExpressions)) {
    if (!expression.test(templateHtml)) {
      throw new Error(
        `A crucial block can't be found in the template: ${name}`
      );
    }
  }
};

const itemMeaning = (item: AnalysisItem): string =>
  `<strong class="text-nowrap">${htmlSpecialChars(item.source)}</strong>${
    item.partOfSpeech ? ` (${htmlSpecialChars(item.partOfSpeech)})` : ''
  }`;

const buildSeoParagraph = (translationCards: TranslationCards): string => {
  const start = `<strong>${htmlSpecialChars(translationCards.source)}</strong> in ${
    languageList[translationCards.sourceLanguage]
  }`;

  if (translationCards.items.length === 1) {
    return start + ` is ${itemMeaning(translationCards.items[0])}.`;
  }

  const meaning = translationCards.items.map(itemMeaning);

  return (
    start +
    ` can be: ` +
    [meaning.slice(0, -1).join(', '), meaning.slice(-1)].join(' or ') +
    '.'
  );
};

const sha256 = (input: string): string =>
  createHash('sha256').update(input).digest('hex');

type Options = {
  templateHtml: string;
  word: string;
  /** The slug of the page URL (see getSeoWordSlug). */
  wordSlug: string;
  pair: SeoLanguagePair;
  translationCards: TranslationCards;
};

export const renderSeoPage = async ({
  templateHtml,
  word,
  wordSlug,
  pair,
  translationCards,
}: Options): Promise<string> => {
  const { sourceLanguage, targetLanguage } = pair;
  const languageName = trimLanguage(languageList[sourceLanguage]);
  const pageName = getSeoPageName(word, sourceLanguage);
  const title = `${pageName} | Vocably`;
  const description = `${pageName} | Vocably - a dictionary for ${languageName} learners`;
  const canonicalUrl = `${canonicalBaseUrl}/${getSeoPagePath(wordSlug, pair)}`;

  const searchValues = {
    text: word,
    sourceLanguage,
    targetLanguage,
    isReversed: false,
  };

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    '@id': canonicalUrl,
    name: pageName,
    hasDefinedTerm: translationCards.items.map((item) => ({
      '@type': 'DefinedTerm',
      '@id':
        canonicalUrl +
        cardToLocationHash({
          source: item.source,
          // Kept as is (even when undefined) so the anchors match the ones
          // the search page generates in the browser.
          partOfSpeech: item.partOfSpeech as string,
        }),
      termCode: item.source,
      name: {
        '@value': item.source,
        '@language': sourceLanguage,
      },
      alternateName: {
        '@value': item.translation,
        '@language': targetLanguage,
      },
      description: joinDefinitions(item.definitions),
    })),
  };

  // Function replacers, because the replacement strings contain user data in
  // which `$&` and friends would otherwise be interpreted.
  const html = templateHtml
    .replace(
      replaceExpressions.container,
      () =>
        `<div id="search"><vocably-search-form values='${htmlSpecialChars(
          JSON.stringify(searchValues)
        )}'></vocably-search-form><p class="mb-2" style="margin-left: 12px;" id="explanation">${buildSeoParagraph(
          translationCards
        )}</p><div class="results-container"><vocably-translation result="${htmlSpecialChars(
          JSON.stringify({ success: true, value: translationCards })
        )}" isLightweight="true" showLanguages="false" hideActions="true"></vocably-translation></div></div>`
    )
    .replace(
      replaceExpressions.canonical,
      () => `<link rel="canonical" href="${htmlSpecialChars(canonicalUrl)}">`
    )
    .replace(
      replaceExpressions.description,
      () =>
        `<meta name="description" content="${htmlSpecialChars(description)}" />`
    )
    .replace(
      replaceExpressions.ogTitle,
      () => `<meta property="og:title" content="${htmlSpecialChars(title)}" />`
    )
    .replace(
      replaceExpressions.ogDescription,
      () =>
        `<meta property="og:description" content="${htmlSpecialChars(
          description
        )}" />`
    )
    .replace(
      replaceExpressions.ogUrl,
      () =>
        `<meta property="og:url" content="${htmlSpecialChars(canonicalUrl)}" />`
    )
    .replace(
      replaceExpressions.repoLink,
      () => `id="repo-link" href="https://github.com/vocably/${sourceLanguage}"`
    )
    .replace(
      '</head>',
      () =>
        // "<" is escaped so a word can't close the script element.
        `<script type="application/ld+json">\n${JSON.stringify(
          structuredData
        ).replace(/</g, '\\u003c')}\n</script></head>`
    );

  const rendered = await renderToString(html, {
    title,
    // Stencil generates a random build id per render otherwise, which would
    // give the same page a different ETag every time it's rendered.
    buildId: sha256(templateHtml).slice(0, 8),
  });

  return rendered.html ?? '';
};
