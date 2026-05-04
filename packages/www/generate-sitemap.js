const { readdirSync, writeFileSync } = require('node:fs');
const { generateSitemap } = require('./seo/generateSitemap');

const exclude = ['index.handlebars', 'app.handlebars', 'console.handlebars'];
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

console.log(xml);

writeFileSync('./dist/sitemap-main.xml', xml);
