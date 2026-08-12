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
  assert.match(await dashboard.text(), /문의함/u);
});
