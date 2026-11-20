import { readdirSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { memoize } from 'lodash-es';

type GenerateSitemapParams = {
  baseUrl: string;
  pages: Array<{
    path: string;
    priority: string;
    filesToValidateLastMod: string[];
  }>;
};

const generateSitemap = ({ baseUrl, pages }: GenerateSitemapParams): string => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset
      xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${pages
  .map((page) => ({
    ...page,
    lastMod: getGitLastModifiedDate(page.filesToValidateLastMod),
  }))
  .map(
    ({ path, priority, lastMod }) => `
<url>
  <loc>${baseUrl}/${path}</loc>
  <lastmod>${lastMod}</lastmod>
  <priority>${priority}</priority>
</url>
`
  )
  .join('')}
</urlset>
`;
};

// Commits with this marker in the message don't bump the page's lastmod
// (e.g. visual-only changes that shouldn't be announced to search engines).
const skipSitemapMarker = '[skip sitemap]';

// Commits that don't bump lastmod of any page, for commits that already
// landed without the marker. Full or abbreviated hashes.
const ignoredCommits = [
  '93f346ee', // fix(notifications): stray vocabowl style tweak
  'dc774b4b40f58da9a9ace0f0d726a5dbf8d17b8a', // feat(www): robot-friendly message
  'f058ceda368b37c6494f03775392cfc38fde0217', // feat(www): better-looking cta button
];

const isIgnoredCommit = (hash: string) =>
  ignoredCommits.some((ignored) => hash.startsWith(ignored));

// @ts-ignore
const getGitLastModifiedDate = memoize(
  (filePaths: string[]): string => {
    let dates: string[] = [];
    for (const filePath of filePaths) {
      // Execute Git command to get the last commit date for the file
      const command = `git log --format="%H %ci" --fixed-strings --invert-grep --grep="${skipSitemapMarker}" -- "${filePath}"`;
      const output =
        execSync(command, { encoding: 'utf8' })
          .split('\n')
          .map((line) => line.trim())
          .find((line) => line && !isIgnoredCommit(line.split(' ')[0]))
          ?.replace(/^\S+ /, '') ?? '';

      const date = output.replace(' ', 'T').replace(/:\d\d .+$/, '+01:00');

      if (date) {
        dates.push(date);
      } else {
        throw new Error(`Can't detect date for file "${filePath}"`);
      }
    }

    if (dates.length === 0) {
      throw new Error(
        'No Git information found for any of the specified files'
      );
    }

    return dates.sort().pop();
  },
  (...args) => JSON.stringify(args)
);

const exclude = [
  'index.handlebars',
  'qr.handlebars',
  'console.handlebars',
  '404.handlebars',
];

export const buildMainSitemap = (baseUrl = 'https://vocably.pro') => {
  const pages = readdirSync('./src/pages').filter(
    (page) => !exclude.includes(page)
  );

  const lowPriorityPages = [
    'welcome-mobile-user.handlebars',
    'terms-and-conditions.handlebars',
    'privacy-policy.handlebars',
    'srs.handlebars',
  ];

  const xml = generateSitemap({
    baseUrl,
    pages: [
      {
        path: 'index.html',
        priority: '1.0',
        filesToValidateLastMod: ['./src/pages/index.handlebars'],
      },
      ...pages.map((handlebarsFile) => ({
        path: handlebarsFile.replace('.handlebars', '.html'),
        priority: lowPriorityPages.includes(handlebarsFile) ? '0.1' : '0.8',
        filesToValidateLastMod: [`./src/pages/${handlebarsFile}`],
      })),
    ],
  });

  writeFileSync('./dist/sitemap-main.xml', xml);
};
