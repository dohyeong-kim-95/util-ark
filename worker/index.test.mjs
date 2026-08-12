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
