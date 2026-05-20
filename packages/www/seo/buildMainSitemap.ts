import { readdirSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { memoize } from 'lodash-es';

type GenerateSitemapParams = {
  pages: Array<{
    path: string;
    priority: string;
    filesToValidateLastMod: string[];
  }>;
};

const generateSitemap = ({ pages }: GenerateSitemapParams): string => {
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
  <loc>https://vocably.pro/${path}</loc>
  <lastmod>${lastMod}</lastmod>
  <priority>${priority}</priority>
</url>
`
  )
  .join('')}
</urlset>
`;
};

// @ts-ignore
const getGitLastModifiedDate = memoize(
  (filePaths: string[]): string => {
    let dates: string[] = [];
    for (const filePath of filePaths) {
      // Execute Git command to get the last commit date for the file
      const command = `git log -1 --format="%ci" -- "${filePath}"`;
      const output = execSync(command, { encoding: 'utf8' }).trim();

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

const exclude = ['index.handlebars', 'app.handlebars', 'console.handlebars'];

export const buildMainSitemap = () => {
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
