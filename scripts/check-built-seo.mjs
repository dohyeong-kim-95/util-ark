import { readFile, readdir } from 'node:fs/promises';

import { TOOL_SUBDOMAINS } from '../worker/subdomains.js';

const dist = new URL('../dist/', import.meta.url);
const requiredPages = [
  'en/index.html',
  'ko/index.html',
  'en/about/index.html',
  'ko/about/index.html',
  'en/privacy/index.html',
  'ko/privacy/index.html',
  'en/contact/index.html',
  'ko/contact/index.html',
  'en/tools/image-converter/index.html',
  'ko/tools/image-converter/index.html',
  'en/tools/word-counter/index.html',
  'ko/tools/word-counter/index.html',
  'en/tools/merge-pdf/index.html',
  'ko/tools/merge-pdf/index.html',
  'en/tools/ladder/index.html',
  'ko/tools/ladder/index.html',
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

// Every subdomain in worker/subdomains.js has to point at a page that was built,
// and every built tool has to be reachable from one of them.
const builtTools = await readdir(new URL('en/tools/', dist));
const liveSubdomainTools = new Set();
for (const [label, entry] of Object.entries(TOOL_SUBDOMAINS)) {
  if (entry.tool && !builtTools.includes(entry.tool)) {
    throw new Error(`${label}.utilark.app points at /tools/${entry.tool}/, which was not built`);
  }
  if (!entry.pending) liveSubdomainTools.add(entry.tool);
}
for (const tool of builtTools) {
  if (!liveSubdomainTools.has(tool)) {
    throw new Error(`the ${tool} tool has no subdomain in worker/subdomains.js`);
  }
}

const sitemapFiles = await readdir(new URL('.', dist));
if (!sitemapFiles.includes('sitemap-index.xml')) throw new Error('missing sitemap-index.xml');

const robots = await readFile(new URL('robots.txt', dist), 'utf8');
if (!robots.includes('https://utilark.app/sitemap-index.xml')) throw new Error('robots.txt has no sitemap');

const koreanHome = await readFile(new URL('ko/index.html', dist), 'utf8');
for (const label of ['TODAY', 'WEEK', 'MONTH', 'data-visitor-stats']) {
  if (!koreanHome.includes(label)) throw new Error(`Korean home: missing public visitor counter ${label}`);
}

const koreanPrivacy = await readFile(new URL('ko/privacy/index.html', dist), 'utf8');
if (!koreanPrivacy.includes('utilark_notrack') || !koreanPrivacy.includes('90일')) {
  throw new Error('Korean privacy policy: missing analytics disclosure');
}

const koreanTerms = await readFile(new URL('ko/terms/index.html', dist), 'utf8');
if (!koreanTerms.includes('접속 수와 개인정보 보호')) {
  throw new Error('Korean terms: missing access-count disclosure');
}

if (!sitemapFiles.includes('ads.txt')) throw new Error('missing ads.txt');
const adsTxt = await readFile(new URL('ads.txt', dist), 'utf8');
const adsenseClient = process.env.PUBLIC_ADSENSE_CLIENT?.trim();
if (adsenseClient && !adsTxt.includes(`google.com, ${adsenseClient.replace(/^ca-/u, '')}, DIRECT,`)) {
  throw new Error('ads.txt does not authorize the configured AdSense publisher');
}
if (!adsenseClient && !adsTxt.startsWith('#')) {
  throw new Error('ads.txt must stay comment-only until an AdSense publisher is configured');
}

const advertisingChecks = [
  ['Google advertising cookie policy link', 'https://policies.google.com/technologies/ads'],
  ['Google Ads Settings link', 'https://myadcenter.google.com/'],
  ['AdSense disclosure', 'Google AdSense'],
];
for (const page of ['en/privacy/index.html', 'ko/privacy/index.html']) {
  const html = await readFile(new URL(page, dist), 'utf8');
  for (const [name, needle] of advertisingChecks) {
    if (!html.includes(needle)) throw new Error(`${page}: missing ${name}`);
  }
}
if (!(await readFile(new URL('en/privacy/index.html', dist), 'utf8')).includes('consent message')) {
  throw new Error('en/privacy: missing consent message disclosure');
}
if (!(await readFile(new URL('ko/privacy/index.html', dist), 'utf8')).includes('동의 메시지')) {
  throw new Error('ko/privacy: missing consent message disclosure');
}

const assetFiles = await readdir(new URL('_astro/', dist));
const cssFiles = assetFiles.filter((file) => file.endsWith('.css'));
const css = (
  await Promise.all(cssFiles.map((file) => readFile(new URL(`_astro/${file}`, dist), 'utf8')))
).join('\n');

const typographyChecks = [
  ['Korean keep-all wrapping', /word-break:keep-all/u],
  ['balanced paragraph wrapping', /text-wrap:pretty/u],
  ['mobile home heading size', /clamp\(2\.45rem,12vw,4rem\)/u],
  ['mobile tool heading size', /clamp\(2\.35rem,11vw,3\.8rem\)/u],
];

for (const [name, pattern] of typographyChecks) {
  if (!pattern.test(css)) throw new Error(`built CSS: missing ${name}`);
}

console.log(
  `SEO checks passed for ${requiredPages.length} localized pages; mobile typography checks passed.`,
);
