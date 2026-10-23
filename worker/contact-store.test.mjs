import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';

import { ContactStore } from './contact-store.js';

const DAY_MS = 24 * 60 * 60 * 1000;

// A stand-in for Durable Object storage: real SQLite through node:sqlite, and
// an alarm slot the test can read back. Only what ContactStore uses.
function fakeState() {
  const db = new DatabaseSync(':memory:');
  const state = {
    db,
    alarmAt: null,
    storage: {
      sql: {
        exec(query, ...params) {
          // The schema is several statements in one string, which only exec() takes.
          if (query.includes('CREATE TABLE')) {
            db.exec(query);
            return [];
          }
          return db.prepare(query).all(...params);
        },
      },
      getAlarm: async () => state.alarmAt,
      setAlarm: async (time) => { state.alarmAt = time; },
    },
  };
  return state;
}

const count = (db, table) => db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get().n;

test('requests no longer purge; a daily alarm removes expired records and reschedules itself', async () => {
  const state = fakeState();
  const store = new ContactStore(state);
  const now = Date.now();
  const oldDay = new Date(now - 100 * DAY_MS).toISOString().slice(0, 10);
  const today = new Date(now).toISOString().slice(0, 10);

  const insertContact = state.db.prepare(
    "INSERT INTO contacts (id, created_at, locale, category, message) VALUES (?, ?, 'en', 'bug', 'message')",
  );
  insertContact.run('expired', now - 181 * DAY_MS);
  insertContact.run('recent', now - DAY_MS);
  state.db.prepare('INSERT INTO analytics_visitors (day, visitor_key) VALUES (?, ?)').run(oldDay, 'old');
  state.db.prepare('INSERT INTO analytics_visitors (day, visitor_key) VALUES (?, ?)').run(today, 'new');

  const response = await store.fetch(new Request('https://contacts.internal/contacts'));
  assert.equal((await response.json()).items.length, 2, 'a request leaves retention to the alarm');
  assert.ok(state.alarmAt !== null && state.alarmAt <= Date.now(), 'the first request schedules an immediate purge');

  await store.alarm();
  assert.deepEqual(state.db.prepare('SELECT id FROM contacts').all().map((row) => row.id), ['recent']);
  assert.equal(count(state.db, 'analytics_visitors'), 1);
  assert.ok(state.alarmAt >= now + DAY_MS - 1000, 'the next purge is a day later');

  // A pending alarm is left alone rather than pulled forward.
  const pending = state.alarmAt;
  await new ContactStore(state).fetch(new Request('https://contacts.internal/contacts'));
  assert.equal(state.alarmAt, pending);
});

test('feedback without publication consent cannot be approved', async () => {
  const store = new ContactStore(fakeState());
  const submit = (publishConsent) => store.fetch(new Request('https://contacts.internal/feedback/submit', {
    method: 'POST',
    body: JSON.stringify({
      visitorKey: 'key',
      feedback: {
        locale: 'en', tool: 'word-counter', helpful: true, reason: 'worked',
        comment: 'This made my cover letter easy to check.', publishConsent,
      },
    }),
  }));
  const approve = (id) => store.fetch(new Request(`https://contacts.internal/feedback/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'approved' }),
  }));

  const privateNote = await (await submit(false)).json();
  assert.equal(privateNote.moderation, 'private');
  const refused = await approve(privateNote.id);
  assert.equal(refused.status, 400);

  const consented = await (await submit(true)).json();
  assert.equal(consented.moderation, 'pending');
  assert.equal((await approve(consented.id)).status, 200);
});

test('one address cannot add more than 50 visitors a day to the published totals', async () => {
  const state = fakeState();
  const store = new ContactStore(state);
  const day = new Date().toISOString().slice(0, 10);
  const record = (visitorKey, addressKey) => store.fetch(new Request('https://contacts.internal/analytics/record', {
    method: 'POST',
    body: JSON.stringify({ day, bot: false, visitorKey, addressKey }),
  }));
  const qualify = (visitorKey, addressKey) => store.fetch(new Request('https://contacts.internal/analytics/qualify', {
    method: 'POST',
    body: JSON.stringify({ day, visitorKey, addressKey }),
  }));

  for (let agent = 1; agent <= 60; agent += 1) {
    await record(`visitor-${agent}`, 'one-address');
    await qualify(`visitor-${agent}`, 'one-address');
  }
  assert.equal(count(state.db, 'analytics_visitors'), 50);
  assert.equal(count(state.db, 'analytics_qualified'), 50);
  // Page views are still counted; only the visitor totals are capped.
  assert.equal(state.db.prepare('SELECT page_views FROM analytics_daily').get().page_views, 60);

  // A visitor already counted can come back without being refused.
  await record('visitor-1', 'one-address');
  assert.equal(count(state.db, 'analytics_visitors'), 50);

  // Another address is unaffected.
  await record('visitor-elsewhere', 'another-address');
  assert.equal(count(state.db, 'analytics_visitors'), 51);
});

test('one address has its own daily cap on contacts and feedback, below the site-wide one', async (t) => {
  let clock = Date.now();
  t.mock.method(Date, 'now', () => clock);
  const store = new ContactStore(fakeState());
  const contact = () => store.fetch(new Request('https://contacts.internal/submit', {
    method: 'POST',
    body: JSON.stringify({
      visitorKey: 'one-address',
      contact: { locale: 'en', category: 'bug', email: '', message: 'A sufficiently detailed report' },
    }),
  }));
  const feedback = (tool) => store.fetch(new Request('https://contacts.internal/feedback/submit', {
    method: 'POST',
    body: JSON.stringify({
      visitorKey: 'one-address',
      feedback: { locale: 'en', tool, helpful: true, reason: 'worked', comment: '', publishConsent: false },
    }),
  }));

  // Five per 15 minutes, so two windows reach the ten a day.
  for (let window = 0; window < 2; window += 1) {
    for (let attempt = 1; attempt <= 5; attempt += 1) {
      assert.equal((await contact()).status, 201, `window ${window}, attempt ${attempt}`);
    }
    clock += 15 * 60 * 1000;
  }
  const eleventh = await contact();
  assert.equal(eleventh.status, 429);
  assert.equal((await eleventh.json()).error, 'rate_limited', 'a per-address refusal, not the site-wide one');

  // Three per tool, twenty across tools: the seventh tool's third note is the 21st.
  for (let tool = 1; tool <= 7; tool += 1) {
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      const response = await feedback(`tool-${tool}`);
      const expected = tool === 7 && attempt === 3 ? 429 : 201;
      assert.equal(response.status, expected, `tool ${tool}, attempt ${attempt}`);
    }
  }
});
