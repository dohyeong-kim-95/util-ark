import assert from 'node:assert/strict';
import test from 'node:test';

import worker from './index.js';
import { TOOL_SUBDOMAINS, resolveHost } from './subdomains.js';

const env = { ASSETS: { fetch: () => new Response('asset') } };

const visit = (target, headers = {}) => worker.fetch(new Request(target, { headers }), env);

test('hostnames are classified before any routing decision', () => {
  assert.equal(resolveHost('utilark.app').kind, 'apex');
  assert.equal(resolveHost('admin.utilark.app').kind, 'admin');
  assert.equal(resolveHost('MergePdf.Utilark.App').kind, 'tool');
  assert.equal(resolveHost('nothing-here.utilark.app').kind, 'unknown');
  assert.equal(resolveHost('deep.mergepdf.utilark.app').kind, 'unknown');

  // Local development and the test harness must keep the normal routes.
  assert.equal(resolveHost('localhost').kind, 'external');
  assert.equal(resolveHost('utilark.app.example.com').kind, 'external');
});

test('a tool subdomain root sends visitors to the localized tool page', async () => {
  const english = await visit('https://mergepdf.utilark.app/', { 'Accept-Language': 'en-US,en;q=0.9' });
  assert.equal(english.status, 302);
  assert.equal(english.headers.get('Location'), 'https://utilark.app/en/merge-pdf/');

  const korean = await visit('https://mergepdf.utilark.app/', { 'Accept-Language': 'ko-KR,ko;q=0.9' });
  assert.equal(korean.headers.get('Location'), 'https://utilark.app/ko/merge-pdf/');

  // The destination varies per request, so it must not be cached or made permanent.
  assert.equal(korean.headers.get('Cache-Control'), 'no-store');
  assert.equal(korean.headers.get('Vary'), 'Accept-Language, Cookie');
});

test('an explicit language choice outranks the browser header', async () => {
  const response = await visit('https://wordcount.utilark.app/', {
    'Accept-Language': 'en-US,en;q=0.9',
    Cookie: 'utilark_lang=ko',
  });
  assert.equal(response.headers.get('Location'), 'https://utilark.app/ko/word-counter/');
});

test('a conversion subdomain lands on that directed pair, not the general converter', async () => {
  const english = await visit('https://png2jpg.utilark.app/', { 'Accept-Language': 'en' });
  assert.equal(english.status, 302);
  assert.equal(english.headers.get('Location'), 'https://utilark.app/en/png-to-jpg/');

  // The reverse direction is its own page, which is the point of the split.
  const reverse = await visit('https://jpg2png.utilark.app/', { 'Accept-Language': 'ko' });
  assert.equal(reverse.headers.get('Location'), 'https://utilark.app/ko/jpg-to-png/');

  // The subdomain spells the pair with a digit, the path spells it out.
  const webp = await visit('https://webp2jpg.utilark.app/', { 'Accept-Language': 'en' });
  assert.equal(webp.headers.get('Location'), 'https://utilark.app/en/webp-to-jpg/');
});

test('a reserved name with no tool yet lands on the localized home', async () => {
  const response = await visit('https://pdf2image.utilark.app/', { 'Accept-Language': 'ko' });
  assert.equal(response.status, 302);
  assert.equal(response.headers.get('Location'), 'https://utilark.app/ko/');
});

test('a subdomain owns only its root, so every other path is normalized to the apex', async () => {
  const deep = await visit('https://mergepdf.utilark.app/ko/privacy/');
  assert.equal(deep.status, 301);
  assert.equal(deep.headers.get('Location'), 'https://utilark.app/ko/privacy/');

  const query = await visit('https://ladder.utilark.app/ko/?ref=share');
  assert.equal(query.status, 301);
  assert.equal(query.headers.get('Location'), 'https://utilark.app/ko/?ref=share');
});

test('an unrecognized subdomain cannot serve a second copy of the site', async () => {
  const response = await visit('https://staging.utilark.app/ko/ladder/');
  assert.equal(response.status, 301);
  assert.equal(response.headers.get('Location'), 'https://utilark.app/ko/ladder/');
});

test('subdomain redirects are not counted as page views', async () => {
  let recorded = false;
  const trackingEnv = {
    ASSETS: { fetch: () => new Response('asset') },
    ADMIN_SESSION_SECRET: 'test-session-secret-value',
    CONTACTS: {
      idFromName: (name) => name,
      get: () => ({
        fetch: () => {
          recorded = true;
          return Response.json({ ok: true });
        },
      }),
    },
  };

  const response = await worker.fetch(
    new Request('https://mergepdf.utilark.app/', { headers: { 'Sec-Fetch-Dest': 'document' } }),
    trackingEnv,
  );
  assert.equal(response.status, 302);
  assert.equal(recorded, false);
});

test('the old /tools/ paths are redirected to where the pages moved', async () => {
  for (const [from, to] of [
    ['https://utilark.app/ko/tools/merge-pdf/', '/ko/merge-pdf/'],
    ['https://utilark.app/en/tools/image-converter/', '/en/image-converter/'],
    ['https://utilark.app/en/tools/ladder', '/en/ladder/'],
  ]) {
    const response = await visit(from);
    assert.equal(response.status, 301, from);
    assert.equal(response.headers.get('Location'), to);
  }

  const query = await visit('https://utilark.app/ko/tools/ladder/?from=share');
  assert.equal(query.headers.get('Location'), '/ko/ladder/?from=share');

  // The redirect must not swallow anything that merely looks like a tool path.
  for (const untouched of [
    'https://utilark.app/ko/privacy/',
    'https://utilark.app/fr/tools/merge-pdf/',
    'https://utilark.app/ko/tools/merge-pdf/extra/',
  ]) {
    assert.equal((await visit(untouched)).status, 200, untouched);
  }
});

test("Naver's ownership file is served even when asset routing would redirect it", async () => {
  const redirectingAssets = {
    fetch: (request) => {
      const path = new URL(request.url).pathname;
      return path.endsWith('.html')
        ? new Response(null, { status: 301, headers: { Location: path.replace(/\.html$/u, '/') } })
        : new Response('naver-site-verification', {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
    },
  };

  const response = await worker.fetch(
    new Request('https://utilark.app/naver1a2b3c4d.html'),
    { ASSETS: redirectingAssets },
  );
  assert.equal(response.status, 200);
  assert.equal(await response.text(), 'naver-site-verification');

  // Only the verification filename is special-cased.
  const other = await worker.fetch(new Request('https://utilark.app/about.html'), { ASSETS: redirectingAssets });
  assert.equal(other.status, 301);
});

test('the apex and the admin host are untouched by subdomain handling', async () => {
  const root = await visit('https://utilark.app/', { 'Accept-Language': 'ko' });
  assert.equal(root.status, 302);
  assert.equal(root.headers.get('Location'), '/ko/');

  const page = await visit('https://utilark.app/ko/merge-pdf/');
  assert.equal(page.status, 200);

  const admin = await visit('https://admin.utilark.app/');
  assert.equal(admin.status, 503, 'admin without secrets stays unavailable rather than redirecting');
});

test('every subdomain name is a usable label with a distinct live destination', () => {
  const live = new Set();
  for (const [label, entry] of Object.entries(TOOL_SUBDOMAINS)) {
    assert.match(label, /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/u, `${label} is not a valid DNS label`);
    assert.ok(label.length <= 63, `${label} is longer than a DNS label allows`);
    if (entry.pending) continue;
    assert.ok(entry.tool, `${label} is a live subdomain and needs a tool`);
    assert.equal(live.has(entry.tool), false, `${entry.tool} already has a live subdomain`);
    live.add(entry.tool);
  }
});
