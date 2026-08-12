import assert from 'node:assert/strict';
import test from 'node:test';
import { resolve } from 'node:path';

import { Miniflare } from 'miniflare';

const projectRoot = resolve(import.meta.dirname, '..');

async function waitForAnalytics(mf, cookie, expectedPageViews) {
  let data;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const response = await mf.dispatchFetch('https://admin.utilark.app/api/analytics', {
      headers: { Cookie: cookie },
    });
    assert.equal(response.status, 200);
    data = await response.json();
    if (data.items[0].pageViews === expectedPageViews) return data;
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 20));
  }
  return data;
}

test('contact submission is persisted and visible only after admin login', async () => {
  const mf = new Miniflare({
    // Keep the local workerd binary's newest supported date; production uses the current date in wrangler.jsonc.
    compatibilityDate: '2026-07-17',
    modules: true,
    modulesRules: [{ type: 'ESModule', include: ['**/*.js'], fallthrough: true }],
    scriptPath: resolve(projectRoot, 'worker/index.js'),
    durableObjects: { CONTACTS: { className: 'ContactStore', useSQLite: true } },
    serviceBindings: {
      ASSETS: () => new Response('<!doctype html><title>Utilark</title>', {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }),
    },
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

    const visitHeaders = {
      'CF-Connecting-IP': '203.0.113.20',
      'User-Agent': 'Mozilla/5.0 Integration Browser',
      'Sec-Fetch-Dest': 'document',
    };
    const analyticsNamespace = await mf.getDurableObjectNamespace('CONTACTS');
    const analyticsStore = analyticsNamespace.get(analyticsNamespace.idFromName('global'));
    const currentDay = new Date().toISOString().slice(0, 10);
    const record = (body) => analyticsStore.fetch('https://contacts.internal/analytics/record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ day: currentDay, ...body }),
    });
    await record({ bot: false, visitorKey: 'first-daily-visitor' });
    await record({ bot: false, visitorKey: 'first-daily-visitor' });
    await record({ bot: false, visitorKey: 'second-daily-visitor' });
    await record({ bot: true });

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

    const metrics = await waitForAnalytics(mf, cookie, 3);
    assert.equal(metrics.items[0].dau, 2);
    assert.equal(metrics.items[0].pageViews, 3);
    assert.equal(metrics.items[0].botRequests, 1);

    const publicMetrics = await mf.dispatchFetch('https://utilark.app/api/analytics/public');
    assert.equal(publicMetrics.status, 200);
    const publicCounts = await publicMetrics.json();
    assert.equal(publicCounts.today, 2);
    assert.equal(publicCounts.week, 2);
    assert.equal(publicCounts.month, 2);

    const excluded = await mf.dispatchFetch('https://admin.utilark.app/api/analytics/exclusion', {
      method: 'POST',
      headers: {
        Cookie: cookie,
        Origin: 'https://admin.utilark.app',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ excluded: true }),
    });
    assert.equal(excluded.status, 200);
    const exclusionCookie = excluded.headers.get('Set-Cookie').split(';', 1)[0];
    await (await mf.dispatchFetch('https://utilark.app/ko/', {
      headers: { ...visitHeaders, Cookie: exclusionCookie },
    })).text();
    const metricsAfterExcludedVisit = await mf.dispatchFetch('https://admin.utilark.app/api/analytics', {
      headers: { Cookie: cookie },
    });
    assert.equal((await metricsAfterExcludedVisit.json()).items[0].pageViews, 3);
  } finally {
    await mf.dispose();
  }
});
