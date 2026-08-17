import assert from 'node:assert/strict';
import test from 'node:test';

import worker from './index.js';

const namespace = (handler) => ({
  idFromName: (name) => name,
  get: () => ({
    fetch: (input, init) => handler(input instanceof Request ? input : new Request(input, init)),
  }),
});

const contactRequest = (body, headers = {}) => new Request('https://utilark.app/api/contact', {
  method: 'POST',
  headers: {
    Origin: 'https://utilark.app',
    'Content-Type': 'application/json',
    'CF-Connecting-IP': '203.0.113.8',
    ...headers,
  },
  body: JSON.stringify(body),
});

const feedbackRequest = (body, headers = {}) => new Request('https://utilark.app/api/feedback', {
  method: 'POST',
  headers: {
    Origin: 'https://utilark.app',
    'Content-Type': 'application/json',
    'CF-Connecting-IP': '203.0.113.18',
    ...headers,
  },
  body: JSON.stringify(body),
});

test('valid contact submissions are normalized and sent to Utilark storage', async () => {
  let stored;
  const env = {
    ADMIN_SESSION_SECRET: 'test-session-secret-value',
    CONTACTS: namespace(async (request) => {
      stored = await request.json();
      return Response.json({ ok: true, id: 'contact-id' }, { status: 201 });
    }),
    ASSETS: { fetch: () => new Response('asset') },
  };

  const response = await worker.fetch(contactRequest({
    locale: 'ko',
    category: 'tool',
    email: 'hello@example.com',
    message: '이런 도구가 있으면 정말 유용할 것 같습니다.',
    website: '',
    consent: true,
  }), env);

  assert.equal(response.status, 201);
  assert.deepEqual(stored.contact, {
    locale: 'ko',
    category: 'tool',
    email: 'hello@example.com',
    message: '이런 도구가 있으면 정말 유용할 것 같습니다.',
  });
  assert.equal(typeof stored.visitorKey, 'string');
  assert.equal(stored.visitorKey.includes('203.0.113.8'), false);
});

test('contact endpoint rejects cross-origin and invalid submissions', async () => {
  const env = {
    ADMIN_SESSION_SECRET: 'test-session-secret-value',
    CONTACTS: namespace(() => Response.json({ ok: true })),
    ASSETS: { fetch: () => new Response('asset') },
  };
  const invalid = await worker.fetch(contactRequest({
    locale: 'en', category: 'bug', message: 'short', consent: true,
  }), env);
  assert.equal(invalid.status, 400);

  const crossOrigin = await worker.fetch(contactRequest({
    locale: 'en', category: 'bug', message: 'A sufficiently detailed report', consent: true,
  }, { Origin: 'https://example.com' }), env);
  assert.equal(crossOrigin.status, 403);
});

test('tool feedback sends only normalized feedback fields and an anonymous rate-limit key', async () => {
  let stored;
  const env = {
    ADMIN_SESSION_SECRET: 'test-session-secret-value',
    CONTACTS: namespace(async (request) => {
      stored = await request.json();
      return Response.json({ ok: true, id: 'feedback-id', moderation: 'pending' }, { status: 201 });
    }),
    ASSETS: { fetch: () => new Response('asset') },
  };
  const response = await worker.fetch(feedbackRequest({
    locale: 'ko',
    tool: 'word-counter',
    helpful: true,
    reason: 'easy',
    comment: '  자기소개서 글자 수를\n확인할 때\t편리했습니다.  ',
    publishConsent: true,
    website: '',
    ignoredToolInput: 'this must not be forwarded',
  }), env);

  assert.equal(response.status, 201);
  assert.deepEqual(stored.feedback, {
    locale: 'ko',
    tool: 'word-counter',
    helpful: true,
    reason: 'easy',
    comment: '자기소개서 글자 수를 확인할 때 편리했습니다.',
    publishConsent: true,
  });
  assert.equal(typeof stored.visitorKey, 'string');
  assert.equal(stored.visitorKey.includes('203.0.113.18'), false);
});

test('tool feedback rejects unknown tools, invalid publication consent, and cross-origin posts', async () => {
  const env = {
    ADMIN_SESSION_SECRET: 'test-session-secret-value',
    CONTACTS: namespace(() => Response.json({ ok: true })),
    ASSETS: { fetch: () => new Response('asset') },
  };
  const base = {
    locale: 'en', helpful: true, reason: 'worked', comment: 'This was useful for my task.', publishConsent: false,
  };
  assert.equal((await worker.fetch(feedbackRequest({ ...base, tool: 'not-a-tool' }), env)).status, 400);
  assert.equal((await worker.fetch(feedbackRequest({
    ...base, tool: 'word-counter', helpful: false, publishConsent: true,
  }), env)).status, 400);
  assert.equal((await worker.fetch(feedbackRequest({ ...base, tool: 'word-counter' }, {
    Origin: 'https://example.com',
  }), env)).status, 403);
});

test('public HTML visits are anonymized before analytics storage and bots omit visitor keys', async () => {
  const records = [];
  const env = {
    ADMIN_SESSION_SECRET: 'test-session-secret-value',
    CONTACTS: namespace(async (request) => {
      records.push(await request.json());
      return Response.json({ ok: true }, { status: 201 });
    }),
    ASSETS: { fetch: () => new Response('<h1>Utilark</h1>', { headers: { 'Content-Type': 'text/html' } }) },
  };
  const humanHeaders = {
    'CF-Connecting-IP': '203.0.113.21',
    'User-Agent': 'Mozilla/5.0 Human Browser',
    'Sec-Fetch-Dest': 'document',
  };
  await worker.fetch(new Request('https://utilark.app/ko/', { headers: humanHeaders }), env);
  await worker.fetch(new Request('https://utilark.app/ko/about/', {
    headers: { ...humanHeaders, 'User-Agent': 'Googlebot/2.1' },
  }), env);

  assert.equal(records.length, 2);
  assert.equal(records[0].bot, false);
  assert.equal(typeof records[0].visitorKey, 'string');
  assert.equal(records[0].visitorKey.includes('203.0.113.21'), false);
  assert.equal(records[1].bot, true);
  assert.equal(records[1].visitorKey, undefined);
});

test('public analytics endpoint exposes only aggregate visitor-day totals', async () => {
  const env = {
    CONTACTS: namespace((request) => {
      assert.equal(new URL(request.url).pathname, '/analytics/public');
      return Response.json({ today: 1, week: 3, month: 10, method: 'sum_of_daily_unique_visitors' });
    }),
    ASSETS: { fetch: () => new Response('not found', { status: 404 }) },
  };
  const response = await worker.fetch(new Request('https://utilark.app/api/analytics/public'), env);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    today: 1,
    week: 3,
    month: 10,
    method: 'sum_of_daily_unique_visitors',
  });
});

test('admin fails closed until secrets are configured', async () => {
  const response = await worker.fetch(new Request('https://admin.utilark.app/'), {
    ADMIN_ID: 'admin',
    CONTACTS: namespace(() => Response.json({})),
  });
  assert.equal(response.status, 503);
  assert.match(await response.text(), /관리자 잠금 상태/u);
  assert.equal(response.headers.get('X-Robots-Tag'), 'noindex, nofollow');
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
});

test('admin login issues an HttpOnly session and opens the inbox', async () => {
  const env = {
    ADMIN_ID: 'admin',
    ADMIN_PASSWORD: 'correct horse battery staple',
    ADMIN_SESSION_SECRET: 'another-long-test-session-secret',
    CONTACTS: namespace(async (request) => {
      if (new URL(request.url).pathname === '/rate-limit') return Response.json({ allowed: true });
      return Response.json({ items: [], counts: { new: 0, read: 0, resolved: 0 } });
    }),
  };
  const login = await worker.fetch(new Request('https://admin.utilark.app/login', {
    method: 'POST',
    headers: { Origin: 'https://admin.utilark.app' },
    body: new URLSearchParams({ id: 'admin', password: 'correct horse battery staple' }),
  }), env);
  assert.equal(login.status, 303);
  const cookie = login.headers.get('Set-Cookie');
  assert.match(cookie, /utilark_admin=/u);
  assert.match(cookie, /HttpOnly/u);
  assert.match(cookie, /SameSite=Strict/u);

  const sessionPair = cookie.split(';', 1)[0];
  const dashboard = await worker.fetch(new Request('https://admin.utilark.app/', {
    headers: { Cookie: sessionPair },
  }), env);
  assert.equal(dashboard.status, 200);
  const dashboardBody = await dashboard.text();
  assert.match(dashboardBody, /접속 현황/u);
  assert.match(dashboardBody, /이 기기 방문자 수 합계 제외/u);
  assert.match(dashboardBody, /도구 의견과 사용자 후기/u);
  assert.match(dashboardBody, /문의함/u);

  const exclusion = await worker.fetch(new Request('https://admin.utilark.app/api/analytics/exclusion', {
    method: 'POST',
    headers: {
      Cookie: sessionPair,
      Origin: 'https://admin.utilark.app',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ excluded: true }),
  }), env);
  assert.equal(exclusion.status, 200);
  assert.match(exclusion.headers.get('Set-Cookie'), /^utilark_notrack=1;/u);
  assert.match(exclusion.headers.get('Set-Cookie'), /Domain=utilark\.app/u);
  assert.match(exclusion.headers.get('Set-Cookie'), /HttpOnly/u);
});

test('the site root redirects to a localized home without loading the language gate', async () => {
  let assetRequests = 0;
  const env = {
    ADMIN_SESSION_SECRET: 'test-session-secret-value',
    CONTACTS: namespace(() => Response.json({ ok: true })),
    ASSETS: {
      fetch: () => {
        assetRequests += 1;
        return new Response('asset', { headers: { 'Content-Type': 'text/html' } });
      },
    },
  };

  const korean = await worker.fetch(new Request('https://utilark.app/', {
    headers: { 'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8' },
  }), env);
  assert.equal(korean.status, 302);
  assert.equal(korean.headers.get('Location'), '/ko/');
  assert.equal(assetRequests, 0);

  const english = await worker.fetch(new Request('https://utilark.app/', {
    headers: { 'Accept-Language': 'fr-FR,fr;q=0.9' },
  }), env);
  assert.equal(english.headers.get('Location'), '/en/');

  const remembered = await worker.fetch(new Request('https://utilark.app/?ref=card', {
    headers: { 'Accept-Language': 'en-US,en;q=0.9', Cookie: 'utilark_lang=ko' },
  }), env);
  assert.equal(remembered.headers.get('Location'), '/ko/?ref=card');
  assert.match(remembered.headers.get('Vary'), /Accept-Language/u);
});

test('the root redirect is not counted as a page view', async () => {
  let recorded = 0;
  const env = {
    ADMIN_SESSION_SECRET: 'test-session-secret-value',
    CONTACTS: namespace((request) => {
      if (new URL(request.url).pathname === '/analytics/record') recorded += 1;
      return Response.json({ ok: true });
    }),
    ASSETS: { fetch: () => new Response('asset', { headers: { 'Content-Type': 'text/html' } }) },
  };

  await worker.fetch(new Request('https://utilark.app/', {
    headers: { 'Accept-Language': 'ko', 'CF-Connecting-IP': '203.0.113.9', 'User-Agent': 'Mozilla/5.0' },
  }), env);
  assert.equal(recorded, 0);

  await worker.fetch(new Request('https://utilark.app/ko/', {
    headers: { 'CF-Connecting-IP': '203.0.113.9', 'User-Agent': 'Mozilla/5.0' },
  }), env);
  assert.equal(recorded, 1);
});

test('a qualified visit is recorded from a beacon and stores no new identifier', async () => {
  const recorded = [];
  const env = {
    ADMIN_SESSION_SECRET: 'test-session-secret-value',
    CONTACTS: namespace(async (request) => {
      recorded.push({ path: new URL(request.url).pathname, body: await request.json() });
      return Response.json({ ok: true }, { status: 202 });
    }),
    ASSETS: { fetch: () => new Response('asset') },
  };
  const beacon = (headers = {}) => new Request('https://utilark.app/api/analytics/qualify', {
    method: 'POST',
    headers: {
      'Sec-Fetch-Site': 'same-origin',
      'CF-Connecting-IP': '203.0.113.40',
      'User-Agent': 'Mozilla/5.0 Reader',
      ...headers,
    },
  });

  const response = await worker.fetch(beacon(), env);
  assert.equal(response.status, 202);
  assert.equal(recorded.length, 1);
  assert.equal(recorded[0].path, '/analytics/qualify');
  assert.match(recorded[0].body.day, /^\d{4}-\d{2}-\d{2}$/u);
  // The key is derived, never the raw address or agent.
  assert.equal(typeof recorded[0].body.visitorKey, 'string');
  assert.equal(recorded[0].body.visitorKey.includes('203.0.113.40'), false);
  assert.equal(recorded[0].body.visitorKey.includes('Reader'), false);

  // The same visitor on the same day resolves to the same key, so the store can
  // deduplicate without anything identifying being kept.
  await worker.fetch(beacon(), env);
  assert.equal(recorded[1].body.visitorKey, recorded[0].body.visitorKey);
});

test('qualified visits honour the same exclusions as page views', async () => {
  let calls = 0;
  const env = {
    ADMIN_SESSION_SECRET: 'test-session-secret-value',
    CONTACTS: namespace(() => { calls += 1; return Response.json({ ok: true }, { status: 202 }); }),
    ASSETS: { fetch: () => new Response('asset') },
  };
  const beacon = (headers) => new Request('https://utilark.app/api/analytics/qualify', {
    method: 'POST',
    headers: { 'Sec-Fetch-Site': 'same-origin', 'User-Agent': 'Mozilla/5.0 Reader', ...headers },
  });

  for (const headers of [
    { DNT: '1' },
    { 'Sec-GPC': '1' },
    { Cookie: 'utilark_notrack=1' },
    { 'User-Agent': 'Googlebot/2.1' },
  ]) {
    const response = await worker.fetch(beacon(headers), env);
    assert.equal(response.status, 202, JSON.stringify(headers));
  }
  assert.equal(calls, 0, 'no excluded visit should reach storage');

  // A cross-origin post is refused outright rather than counted.
  const foreign = await worker.fetch(new Request('https://utilark.app/api/analytics/qualify', {
    method: 'POST',
    headers: { 'Sec-Fetch-Site': 'cross-site', Origin: 'https://example.com' },
  }), env);
  assert.equal(foreign.status, 403);
  assert.equal(calls, 0);
});
