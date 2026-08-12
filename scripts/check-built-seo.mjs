import { readFile, readdir } from 'node:fs/promises';

const dist = new URL('../dist/', import.meta.url);
const requiredPages = [
  'en/index.html',
  'ko/index.html',
  'en/about/index.html',
  'ko/about/index.html',
  'en/privacy/index.html',
  'ko/privacy/index.html',
  'en/tools/image-converter/index.html',
  'ko/tools/image-converter/index.html',
  'en/tools/word-counter/index.html',
  'ko/tools/word-counter/index.html',
  'en/tools/merge-pdf/index.html',
  'ko/tools/merge-pdf/index.html',
];

const checks = [
  ['canonical', /rel="canonical"/u],
  ['description', /<meta name="description"/u],
  ['English hreflang', /hreflang="en"/u],
  ['Korean hreflang', /hreflang="ko"/u],
  ['x-default hreflang', /hreflang="x-default"/u],
  ['Open Graph title', /property="og:title"/u],
  ['structured data', /type="application\/ld\+json"/u],
];

for (const page of requiredPages) {
  const html = await readFile(new URL(page, dist), 'utf8');
  for (const [name, pattern] of checks) {
    if (!pattern.test(html)) throw new Error(`${page}: missing ${name}`);
  }
}

const sitemapFiles = await readdir(new URL('.', dist));
if (!sitemapFiles.includes('sitemap-index.xml')) throw new Error('missing sitemap-index.xml');

const robots = await readFile(new URL('robots.txt', dist), 'utf8');
if (!robots.includes('https://utilark.app/sitemap-index.xml')) throw new Error('robots.txt has no sitemap');

console.log(`SEO checks passed for ${requiredPages.length} localized pages.`);
