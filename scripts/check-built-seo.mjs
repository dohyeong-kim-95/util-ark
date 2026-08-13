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
  'en/image-converter/index.html',
  'ko/image-converter/index.html',
  'en/word-counter/index.html',
  'ko/word-counter/index.html',
  'en/merge-pdf/index.html',
  'ko/merge-pdf/index.html',
  'en/ladder/index.html',
  'ko/ladder/index.html',
  'en/guides/index.html',
  'ko/guides/index.html',
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

// Tool pages sit at /{locale}/{slug}/ next to about, privacy, and the rest, so
// the built directory no longer tells us which of them are tools. Take the list
// from the slug union in the source instead, which is what the pages are
// generated from.
const toolSource = await readFile(new URL('../src/data/tools.ts', import.meta.url), 'utf8');
const slugUnion = toolSource.match(/slug:\s*((?:'[a-z0-9-]+'\s*\|\s*)*'[a-z0-9-]+');/u)?.[1];
if (!slugUnion) throw new Error('src/data/tools.ts: could not read the tool slug union');
const allTools = [...slugUnion.matchAll(/'([a-z0-9-]+)'/gu)].map((match) => match[1]);

// Directed conversion pairs are separate indexed pages sharing the tool route.
const conversionSource = await readFile(new URL('../src/data/conversions.ts', import.meta.url), 'utf8');
const allConversions = [...conversionSource.matchAll(/^\s{4}slug: '([a-z0-9-]+)',$/gmu)].map((match) => match[1]);
if (allConversions.length === 0) throw new Error('src/data/conversions.ts: could not read the pair slugs');
const indexedPages = [...allTools, ...allConversions];

// Tool pages target search queries, so their titles carry the keyword plus a
// synonym and "free"/"online" instead of the plain `${name} · Utilark` form.
// Google truncates past roughly 60 characters.
for (const [page, freeWord] of [['en', 'Free'], ['ko', '무료']]) {
  for (const tool of indexedPages) {
    const file = `${page}/${tool}/index.html`;
    const html = await readFile(new URL(file, dist), 'utf8');
    // Measure what the search result shows, not the escaped source: `&amp;`
    // is one character on the page and five in the markup.
    const title = html.match(/<title>([^<]*)<\/title>/u)?.[1]
      ?.replaceAll('&amp;', '&')
      .replaceAll('&#39;', "'")
      .replaceAll('&quot;', '"')
      .replaceAll('&lt;', '<')
      .replaceAll('&gt;', '>');
    if (!title) throw new Error(`${file}: no title`);
    if (title.includes(' · Utilark')) throw new Error(`${file}: still uses the plain title form`);
    if (!title.endsWith('| Utilark')) throw new Error(`${file}: title does not end with the brand`);
    if (!title.includes(freeWord)) throw new Error(`${file}: title is missing "${freeWord}"`);
    if (title.length > 60) throw new Error(`${file}: title is ${title.length} characters, over 60`);
  }
}

// Guides carry the depth the tool pages cannot, so they have to be substantial
// and reachable. Each one links to the tool it explains, and that tool links
// back, which is the internal linking the research doc found on ranking sites.
const guideSource = await readFile(new URL('../src/data/guides.ts', import.meta.url), 'utf8');
const guideEntries = [...guideSource.matchAll(/slug: '([a-z0-9-]+)',\s*\n\s*tool: '([a-z0-9-]+)',/gu)]
  .map((match) => ({ slug: match[1], tool: match[2] }));
if (guideEntries.length === 0) throw new Error('src/data/guides.ts: could not read the guides');

for (const locale of ['en', 'ko']) {
  const index = await readFile(new URL(`${locale}/guides/index.html`, dist), 'utf8');
  for (const { slug, tool } of guideEntries) {
    if (!index.includes(`href="/${locale}/guides/${slug}/"`)) {
      throw new Error(`${locale}/guides/: does not link to the ${slug} guide`);
    }

    const file = `${locale}/guides/${slug}/index.html`;
    const html = await readFile(new URL(file, dist), 'utf8');
    for (const [name, pattern] of checks) {
      if (!pattern.test(html)) throw new Error(`${file}: missing ${name}`);
    }

    const main = html.slice(html.indexOf('<main'), html.indexOf('</main>'));
    const words = main.replace(/<script[\s\S]*?<\/script>/gu, '').replace(/<[^>]+>/gu, ' ');
    const size = locale === 'ko' ? words.replace(/\s+/gu, '').length : words.split(/\s+/u).filter(Boolean).length;
    const floor = locale === 'ko' ? 900 : 450;
    if (size < floor) throw new Error(`${file}: body is ${size}, under the ${floor} a guide should carry`);

    if (!html.includes(`href="/${locale}/${tool}/"`)) {
      throw new Error(`${file}: does not link to the ${tool} tool it explains`);
    }

    const toolPage = await readFile(new URL(`${locale}/${tool}/index.html`, dist), 'utf8');
    if (!toolPage.includes(`href="/${locale}/guides/${slug}/"`)) {
      throw new Error(`${locale}/${tool}/: does not link back to its ${slug} guide`);
    }
  }
}

// A tool page must link to every other tool. Ranking competitors carry the whole
// tool list on each tool page; without it these pages never pass signal to each
// other and the only way out is the breadcrumb.
for (const locale of ['en', 'ko']) {
  for (const tool of allTools) {
    const file = `${locale}/${tool}/index.html`;
    const html = await readFile(new URL(file, dist), 'utf8');
    for (const other of allTools.filter((entry) => entry !== tool)) {
      if (!html.includes(`href="/${locale}/${other}/"`)) {
        throw new Error(`${file}: does not link to the ${other} tool`);
      }
    }
  }
}

// Every subdomain in worker/subdomains.js has to point at a page that was built,
// and every built tool has to be reachable from one of them.
const liveSubdomainTargets = new Set();
for (const [label, entry] of Object.entries(TOOL_SUBDOMAINS)) {
  if (entry.tool && !indexedPages.includes(entry.tool)) {
    throw new Error(`${label}.utilark.app points at /${entry.tool}/, which is not a page`);
  }
  if (!entry.pending) liveSubdomainTargets.add(entry.tool);
}
for (const page of indexedPages) {
  if (!liveSubdomainTargets.has(page)) {
    throw new Error(`the ${page} page has no subdomain in worker/subdomains.js`);
  }
}

// Every pair links to the other five and back to the hub, and the hub lists all
// six. Six near-identical pages that only link outward would be clustered as
// duplicates, which is exactly what splitting them is meant to avoid.
for (const locale of ['en', 'ko']) {
  const hub = await readFile(new URL(`${locale}/image-converter/index.html`, dist), 'utf8');
  for (const pair of allConversions) {
    if (!hub.includes(`href="/${locale}/${pair}/"`)) {
      throw new Error(`${locale}/image-converter/: does not link to the ${pair} page`);
    }
    const html = await readFile(new URL(`${locale}/${pair}/index.html`, dist), 'utf8');
    if (!html.includes(`href="/${locale}/image-converter/"`)) {
      throw new Error(`${locale}/${pair}/: does not link back to the converter hub`);
    }
    for (const other of allConversions.filter((entry) => entry !== pair)) {
      if (!html.includes(`href="/${locale}/${other}/"`)) {
        throw new Error(`${locale}/${pair}/: does not link to the ${other} page`);
      }
    }
  }
}

// Naver's ownership check reads a meta tag, and its rules are specific: the tag
// is ignored inside <body> or a frame, and the verifier does not run
// JavaScript. The site root answers with a server-side redirect, which Naver
// does support (301 and 302 both), so the tag also has to be on the localized
// pages the verifier lands on rather than only on the language gate.
const naverVerification = process.env.PUBLIC_NAVER_SITE_VERIFICATION?.trim();
const NAVER_TAG = 'name="naver-site-verification"';
for (const page of ['index.html', 'en/index.html', 'ko/index.html', 'en/merge-pdf/index.html']) {
  const html = await readFile(new URL(page, dist), 'utf8');
  const head = html.slice(html.indexOf('<head>'), html.indexOf('</head>'));
  if (naverVerification) {
    if (!head.includes(`content="${naverVerification}"`)) {
      throw new Error(`${page}: the Naver verification tag is missing from <head>`);
    }
    if (html.slice(html.indexOf('</head>')).includes(NAVER_TAG)) {
      throw new Error(`${page}: a Naver verification tag sits outside <head>, where it is ignored`);
    }
  } else if (html.includes(NAVER_TAG)) {
    throw new Error(`${page}: has a Naver verification tag with no variable configured`);
  }
  if (/<frame[\s>]/iu.test(html)) throw new Error(`${page}: frames hide the verification tag from Naver`);
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
