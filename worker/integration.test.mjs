import assert from 'node:assert/strict';
import test from 'node:test';
import { resolve } from 'node:path';

import { Miniflare } from 'miniflare';

const projectRoot = resolve(import.meta.dirname, '..');

test('contact submission is persisted and visible only after admin login', async () => {
  const mf = new Miniflare({
    // Keep the local workerd binary's newest supported date; production uses the current date in wrangler.jsonc.
    compatibilityDate: '2026-07-17',
    modules: true,
    modulesRules: [{ type: 'ESModule', include: ['**/*.js'], fallthrough: true }],
    scriptPath: resolve(projectRoot, 'worker/index.js'),
    durableObjects: { CONTACTS: { className: 'ContactStore', useSQLite: true } },
    bindings: {
      ADMIN_ID: 'admin',
      ADMIN_PASSWORD: 'integration-test-password',
      ADMIN_SESSION_SECRET: 'integration-test-session-secret-value',
    },
  });

  try {
    const submitted = await mf.dispatchFetch('https://utilark.app/api/contact', {
      method: 'POST',
      headers: {
        Origin: 'https://utilark.app',
        'Content-Type': 'application/json',
        'CF-Connecting-IP': '203.0.113.10',
      },
      body: JSON.stringify({
        locale: 'en',
        category: 'feedback',
        email: '',
        message: 'This is a complete integration test contact message.',
        website: '',
        consent: true,
      }),
    });
    const submittedText = await submitted.text();
    assert.equal(submitted.status, 201, submittedText);

    const anonymousApi = await mf.dispatchFetch('https://admin.utilark.app/api/contacts');
    assert.equal(anonymousApi.status, 401);

    const login = await mf.dispatchFetch('https://admin.utilark.app/login', {
      method: 'POST',
      redirect: 'manual',
      headers: {
        Origin: 'https://admin.utilark.app',
        'Content-Type': 'application/x-www-form-urlencoded',
        'CF-Connecting-IP': '203.0.113.11',
      },
      body: new URLSearchParams({ id: 'admin', password: 'integration-test-password' }).toString(),
    });
    assert.equal(login.status, 303);
    const cookie = login.headers.get('Set-Cookie').split(';', 1)[0];

    const inbox = await mf.dispatchFetch('https://admin.utilark.app/api/contacts', {
      headers: { Cookie: cookie },
    });
    assert.equal(inbox.status, 200);
    const data = await inbox.json();
    assert.equal(data.items.length, 1);
    assert.equal(data.items[0].message, 'This is a complete integration test contact message.');
    assert.equal(data.counts.new, 1);
  } finally {
    await mf.dispose();
  }
});
