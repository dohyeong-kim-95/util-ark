import assert from 'node:assert/strict';
import test from 'node:test';

import {
  issueSession,
  likelySameOriginBeacon,
  sameOriginMutation,
  sign,
  validSession,
} from './security.js';
import {
  dailyVisitorKey,
  likelyBot,
  privacyOptOut,
  trackablePageView,
  trackingExcluded,
} from './analytics.js';

test('signed admin sessions expire and reject tampering', async () => {
  const secret = 'a-test-secret-that-is-long-enough';
  const now = 1_700_000_000_000;
  const token = await issueSession(secret, now);

  assert.equal(await validSession(secret, token, now + 1000), true);
  assert.equal(await validSession(secret, `${token}x`, now + 1000), false);
  assert.equal(await validSession(secret, token, now + 25 * 60 * 60 * 1000), false);
});

test('visitor signatures are stable without exposing the source value', async () => {
  const result = await sign('secret', 'visitor:203.0.113.8');
  assert.equal(result, await sign('secret', 'visitor:203.0.113.8'));
  assert.equal(result.includes('203.0.113.8'), false);
});

test('state-changing requests require the exact origin', () => {
  assert.equal(sameOriginMutation(new Request('https://utilark.app/api/contact', {
    method: 'POST',
    headers: { Origin: 'https://utilark.app', 'Sec-Fetch-Site': 'same-origin' },
  })), true);
  assert.equal(sameOriginMutation(new Request('https://utilark.app/api/contact', {
    method: 'POST',
    headers: { Origin: 'https://example.com', 'Sec-Fetch-Site': 'cross-site' },
  })), false);
});

test('a beacon is judged same-origin by whichever signal is present, and same-origin when neither is', () => {
  const post = (headers) => new Request('https://utilark.app/api/analytics/qualify', { method: 'POST', headers });

  // Chromium: Sec-Fetch-Site is authoritative even without Origin.
  assert.equal(likelySameOriginBeacon(post({ 'Sec-Fetch-Site': 'same-origin' })), true);
  assert.equal(likelySameOriginBeacon(post({ 'Sec-Fetch-Site': 'cross-site' })), false);
  // A browser that only sends Origin (no Fetch Metadata support) is judged by it.
  assert.equal(likelySameOriginBeacon(post({ Origin: 'https://utilark.app' })), true);
  assert.equal(likelySameOriginBeacon(post({ Origin: 'https://example.com' })), false);
  // Safari/WebKit ships neither header for a same-origin sendBeacon call —
  // the case that was silently dropping real visits — so absence of any
  // signal must be accepted rather than rejected.
  assert.equal(likelySameOriginBeacon(post({})), true);
});

test('analytics keys deduplicate only matching visitors on the same day', async () => {
  const request = new Request('https://utilark.app/ko/', {
    headers: { 'CF-Connecting-IP': '203.0.113.8', 'User-Agent': 'Example Browser' },
  });
  const first = await dailyVisitorKey(request, 'secret', '2026-08-12');
  assert.equal(first, await dailyVisitorKey(request, 'secret', '2026-08-12'));
  assert.notEqual(first, await dailyVisitorKey(request, 'secret', '2026-08-13'));
  assert.equal(first.includes('203.0.113.8'), false);
});

test('analytics excludes bots, non-document requests, and privacy opt-outs', () => {
  const html = new Response('ok', { headers: { 'Content-Type': 'text/html' } });
  const human = new Request('https://utilark.app/ko/', {
    headers: { 'User-Agent': 'Mozilla/5.0', 'Sec-Fetch-Dest': 'document' },
  });
  assert.equal(likelyBot(human), false);
  assert.equal(trackablePageView(human, html), true);
  assert.equal(likelyBot(new Request('https://utilark.app/', { headers: { 'User-Agent': 'Googlebot/2.1' } })), true);
  assert.equal(trackablePageView(new Request('https://utilark.app/a.css', {
    headers: { 'User-Agent': 'Mozilla/5.0', 'Sec-Fetch-Dest': 'style' },
  }), html), false);
  const optedOut = new Request('https://utilark.app/ko/', { headers: { DNT: '1' } });
  assert.equal(privacyOptOut(optedOut), true);
  assert.equal(trackablePageView(optedOut, html), false);
  const adminBrowser = new Request('https://utilark.app/ko/', {
    headers: { Cookie: 'utilark_notrack=1', 'User-Agent': 'Mozilla/5.0' },
  });
  assert.equal(trackingExcluded(adminBrowser), true);
  assert.equal(trackablePageView(adminBrowser, html), false);
});
