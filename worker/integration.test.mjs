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

    const feedback = await mf.dispatchFetch('https://utilark.app/api/feedback', {
      method: 'POST',
      headers: {
        Origin: 'https://utilark.app',
        'Content-Type': 'application/json',
        'CF-Connecting-IP': '203.0.113.12',
      },
      body: JSON.stringify({
        locale: 'en',
        tool: 'word-counter',
        helpful: true,
        reason: 'worked',
        comment: 'It made checking a cover\nletter much quicker.',
        publishConsent: true,
        website: '',
      }),
    });
    assert.equal(feedback.status, 201, await feedback.text());

    const hiddenQuotes = await mf.dispatchFetch('https://utilark.app/api/feedback/public?locale=en');
    assert.equal(hiddenQuotes.status, 200);
    assert.equal((await hiddenQuotes.json()).items.length, 0);

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
    const anonymousFeedbackApi = await mf.dispatchFetch('https://admin.utilark.app/api/feedback');
    assert.equal(anonymousFeedbackApi.status, 401);

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

    const feedbackInbox = await mf.dispatchFetch('https://admin.utilark.app/api/feedback', {
      headers: { Cookie: cookie },
    });
    assert.equal(feedbackInbox.status, 200);
    const feedbackData = await feedbackInbox.json();
    assert.equal(feedbackData.items.length, 1);
    assert.equal(feedbackData.items[0].status, 'pending');
    assert.equal(feedbackData.items[0].publishConsent, true);

    const approved = await mf.dispatchFetch(
      `https://admin.utilark.app/api/feedback/${feedbackData.items[0].id}`,
      {
        method: 'PATCH',
        headers: {
          Cookie: cookie,
          Origin: 'https://admin.utilark.app',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'approved' }),
      },
    );
    assert.equal(approved.status, 200);
    const publicQuotes = await mf.dispatchFetch('https://utilark.app/api/feedback/public?locale=en&tool=word-counter');
    assert.equal(publicQuotes.status, 200);
    const quoteData = await publicQuotes.json();
    assert.equal(quoteData.approvedTotal, 1);
    assert.deepEqual(quoteData.summary, { total: 1, helpful: 1 });
    assert.deepEqual(quoteData.items, [{
      tool: 'word-counter',
      quote: 'It made checking a cover letter much quicker.',
    }]);

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

test('the image-compress funnel records a page view plus deduplicated steps and reads back in the admin dashboard', async () => {
  const mf = new Miniflare({
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
    const visitHeaders = {
      'CF-Connecting-IP': '203.0.113.70',
      'User-Agent': 'Mozilla/5.0 Integration Browser',
      'Sec-Fetch-Dest': 'document',
    };

    // Visiting the tool page records its "view" step automatically, alongside
    // the sitewide page view every page already gets.
    await mf.dispatchFetch('https://utilark.app/en/image-compress/', { headers: visitHeaders });

    const beacon = (event) => mf.dispatchFetch('https://utilark.app/api/usage/event', {
      method: 'POST',
      headers: { ...visitHeaders, 'Sec-Fetch-Site': 'same-origin', 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool: 'image-compress', event }),
    });

    // The same visitor firing "selected" twice (a reselect, or a refresh)
    // must still land as one for the day.
    assert.equal((await beacon('selected')).status, 202);
    assert.equal((await beacon('selected')).status, 202);
    assert.equal((await beacon('compressed')).status, 202);
    assert.equal((await beacon('downloaded')).status, 202);

    // A second, distinct visitor also selects a photo but never finishes.
    await mf.dispatchFetch('https://utilark.app/api/usage/event', {
      method: 'POST',
      headers: {
        'CF-Connecting-IP': '203.0.113.71',
        'User-Agent': 'Mozilla/5.0 Second Visitor',
        'Sec-Fetch-Site': 'same-origin',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tool: 'image-compress', event: 'selected' }),
    });

    const login = await mf.dispatchFetch('https://admin.utilark.app/login', {
      method: 'POST',
      redirect: 'manual',
      headers: {
        Origin: 'https://admin.utilark.app',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ id: 'admin', password: 'integration-test-password' }).toString(),
    });
    assert.equal(login.status, 303);
    const cookie = login.headers.get('Set-Cookie').split(';', 1)[0];

    const funnel = await mf.dispatchFetch('https://admin.utilark.app/api/analytics/tool-funnel?tool=image-compress', {
      headers: { Cookie: cookie },
    });
    assert.equal(funnel.status, 200);
    const funnelData = await funnel.json();
    assert.equal(funnelData.tool, 'image-compress');
    const today = funnelData.items[0];
    assert.equal(today.view, 1);
    assert.equal(today.selected, 2, 'two distinct visitors selecting once each, the repeat deduplicated');
    assert.equal(today.compressed, 1);
    assert.equal(today.downloaded, 1);

    const unknownTool = await mf.dispatchFetch('https://admin.utilark.app/api/analytics/tool-funnel?tool=made-up', {
      headers: { Cookie: cookie },
    });
    assert.equal(unknownTool.status, 400);
  } finally {
    await mf.dispose();
  }
});

const startWorker = (extraBindings = {}) => new Miniflare({
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
    ...extraBindings,
  },
});

const loginAttempt = (mf, address, password) => mf.dispatchFetch('https://admin.utilark.app/login', {
  method: 'POST',
  redirect: 'manual',
  headers: {
    Origin: 'https://admin.utilark.app',
    'Content-Type': 'application/x-www-form-urlencoded',
    'CF-Connecting-IP': address,
  },
  body: new URLSearchParams({ id: 'admin', password }).toString(),
});

test('admin login answers 401 to a wrong password, 429 per address, and 429 for everyone past the global cap', async () => {
  const mf = startWorker();
  try {
    for (let attempt = 1; attempt <= 5; attempt += 1) {
      const response = await loginAttempt(mf, '198.51.100.1', 'wrong-password');
      await response.text();
      assert.equal(response.status, 401, `attempt ${attempt}`);
    }
    const sixth = await loginAttempt(mf, '198.51.100.1', 'integration-test-password');
    await sixth.text();
    assert.equal(sixth.status, 429, 'the sixth attempt from one address is refused even with the right password');

    // Five more addresses use up the rest of the 30 global attempts an hour.
    for (let host = 2; host <= 6; host += 1) {
      for (let attempt = 1; attempt <= 5; attempt += 1) {
        const response = await loginAttempt(mf, `198.51.100.${host}`, 'wrong-password');
        await response.text();
        assert.equal(response.status, 401, `address ${host}, attempt ${attempt}`);
      }
    }
    const fresh = await loginAttempt(mf, '198.51.100.99', 'integration-test-password');
    await fresh.text();
    assert.equal(fresh.status, 429, 'a new address is refused once the global cap is spent');
  } finally {
    await mf.dispose();
  }
});

test('rotating addresses inside one IPv6 /64 shares a single per-address login limit', async () => {
  const mf = startWorker();
  try {
    for (let host = 1; host <= 5; host += 1) {
      const response = await loginAttempt(mf, `2001:db8:1:2::${host}`, 'wrong-password');
      await response.text();
      assert.equal(response.status, 401, `address ${host}`);
    }
    const sameBlock = await loginAttempt(mf, '2001:db8:1:2:ffff::9', 'integration-test-password');
    await sameBlock.text();
    assert.equal(sameBlock.status, 429, 'another address in the same /64 is refused');
    const otherBlock = await loginAttempt(mf, '2001:db8:1:3::1', 'integration-test-password');
    await otherBlock.text();
    assert.equal(otherBlock.status, 303, 'a different /64 is a different sender');
  } finally {
    await mf.dispose();
  }
});

test('ADMIN_LOGIN_ALLOW_IPS lets the owner in while the global login limit is spent', async () => {
  const mf = startWorker({ ADMIN_LOGIN_ALLOW_IPS: '203.0.113.7, 2001:db8:aaaa::/48' });
  try {
    // Six addresses use up the 30 global attempts an hour.
    for (let host = 1; host <= 6; host += 1) {
      for (let attempt = 1; attempt <= 5; attempt += 1) {
        const response = await loginAttempt(mf, `198.51.100.${host}`, 'wrong-password');
        await response.text();
      }
    }
    const stranger = await loginAttempt(mf, '198.51.100.99', 'integration-test-password');
    await stranger.text();
    assert.equal(stranger.status, 429, 'an unlisted address is still refused');

    const owner = await loginAttempt(mf, '203.0.113.7', 'integration-test-password');
    await owner.text();
    assert.equal(owner.status, 303, 'a listed IPv4 address skips the global limit');
    const ownerV6 = await loginAttempt(mf, '2001:db8:aaaa:5::1', 'integration-test-password');
    await ownerV6.text();
    assert.equal(ownerV6.status, 303, 'an address inside a listed IPv6 range skips it too');

    // A listed address still has its own per-address limit.
    for (let attempt = 1; attempt <= 4; attempt += 1) {
      const response = await loginAttempt(mf, '203.0.113.7', 'wrong-password');
      await response.text();
      assert.equal(response.status, 401, `listed attempt ${attempt}`);
    }
    const sixth = await loginAttempt(mf, '203.0.113.7', 'integration-test-password');
    await sixth.text();
    assert.equal(sixth.status, 429);
  } finally {
    await mf.dispose();
  }
});

const contactFrom = (mf, address) => mf.dispatchFetch('https://utilark.app/api/contact', {
  method: 'POST',
  headers: { Origin: 'https://utilark.app', 'Content-Type': 'application/json', 'CF-Connecting-IP': address },
  body: JSON.stringify({ locale: 'en', category: 'bug', message: 'A sufficiently detailed report', consent: true }),
});

const feedbackFrom = (mf, address, tool = 'word-counter') => mf.dispatchFetch('https://utilark.app/api/feedback', {
  method: 'POST',
  headers: { Origin: 'https://utilark.app', 'Content-Type': 'application/json', 'CF-Connecting-IP': address },
  body: JSON.stringify({ locale: 'en', tool, helpful: true, reason: 'worked', comment: '', publishConsent: false }),
});

test('contact submissions are limited per address and across all addresses per day', async () => {
  const mf = startWorker();
  try {
    for (let attempt = 1; attempt <= 5; attempt += 1) {
      const response = await contactFrom(mf, '198.51.100.1');
      assert.equal(response.status, 201, await response.text());
    }
    const sixth = await contactFrom(mf, '198.51.100.1');
    await sixth.text();
    assert.equal(sixth.status, 429);
    assert.ok(Number(sixth.headers.get('Retry-After')) > 0);

    // 5 accepted so far; 39 more addresses sending 5 each reach the 200 a day.
    for (let host = 2; host <= 40; host += 1) {
      for (let attempt = 1; attempt <= 5; attempt += 1) {
        const response = await contactFrom(mf, `198.51.100.${host}`);
        await response.text();
        assert.equal(response.status, 201, `address ${host}, attempt ${attempt}`);
      }
    }
    const overCap = await contactFrom(mf, '198.51.100.200');
    assert.equal(overCap.status, 429, 'a new address is refused once the daily cap is reached');
    assert.equal((await overCap.json()).error, 'daily_limit', 'the full day is told apart from a per-address limit');
  } finally {
    await mf.dispose();
  }
});

test('feedback allows a few notes per shared address and stops at a daily cap', async () => {
  const mf = startWorker();
  try {
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      const response = await feedbackFrom(mf, '198.51.100.1');
      assert.equal(response.status, 201, await response.text());
    }
    const fourth = await feedbackFrom(mf, '198.51.100.1');
    await fourth.text();
    assert.equal(fourth.status, 429, 'the fourth note on one tool from one address is refused');
    const otherTool = await feedbackFrom(mf, '198.51.100.1', 'merge-pdf');
    await otherTool.text();
    assert.equal(otherTool.status, 201, 'the limit is per tool');

    // 4 accepted; 49 addresses × 4 (3 + 1 on another tool) = 196 more reach 200.
    for (let host = 2; host <= 50; host += 1) {
      for (const tool of ['word-counter', 'word-counter', 'word-counter', 'merge-pdf']) {
        const response = await feedbackFrom(mf, `198.51.100.${host}`, tool);
        await response.text();
        assert.equal(response.status, 201, `address ${host}, ${tool}`);
      }
    }
    const overCap = await feedbackFrom(mf, '198.51.100.200');
    assert.equal(overCap.status, 429, 'a new address is refused once the daily cap is reached');
    assert.equal((await overCap.json()).error, 'daily_limit');
  } finally {
    await mf.dispose();
  }
});
