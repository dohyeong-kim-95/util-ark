import assert from 'node:assert/strict';
import test from 'node:test';

import {
  issueSession,
  sameOriginMutation,
  sign,
  validSession,
} from './security.js';

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
