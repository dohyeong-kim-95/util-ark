import assert from 'node:assert/strict';
import test from 'node:test';

import { acceptLanguageLocale, preferredLocale } from './locale.js';

test('Accept-Language picks the highest weighted supported locale', () => {
  assert.equal(acceptLanguageLocale('ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'), 'ko');
  assert.equal(acceptLanguageLocale('en-US,en;q=0.9,ko;q=0.8'), 'en');
  assert.equal(acceptLanguageLocale('ja-JP,ja;q=0.9,ko;q=0.4'), 'ko');
  assert.equal(acceptLanguageLocale('fr;q=0.9,ko;q=0.1,en;q=0.8'), 'en');
});

test('unsupported, empty, and wildcard Accept-Language values fall back to English', () => {
  assert.equal(acceptLanguageLocale('ja,zh-CN;q=0.9'), 'en');
  assert.equal(acceptLanguageLocale('*'), 'en');
  assert.equal(acceptLanguageLocale(''), 'en');
  assert.equal(acceptLanguageLocale(undefined), 'en');
  assert.equal(acceptLanguageLocale('ko;q=0'), 'en');
});

test('a stored language cookie wins over the browser header', () => {
  const request = (headers) => new Request('https://utilark.app/', { headers });
  assert.equal(preferredLocale(request({ 'Accept-Language': 'en-US', Cookie: 'utilark_lang=ko' })), 'ko');
  assert.equal(preferredLocale(request({ 'Accept-Language': 'ko-KR', Cookie: 'utilark_lang=en' })), 'en');
  assert.equal(preferredLocale(request({ 'Accept-Language': 'ko-KR', Cookie: 'utilark_lang=ja' })), 'ko');
});
