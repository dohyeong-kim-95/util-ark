import assert from 'node:assert/strict';
import test from 'node:test';

import { chosungOf, jamoOf, layoutJamo, normalize, searchEntries, type SearchEntry } from '../src/lib/search-rules.ts';

/**
 * A stand-in for the built index. Kept small and hand-written so a failure names
 * a rule rather than a data change: the real index is rebuilt whenever copy is
 * edited, and a test bound to it would fail on rewording instead of on a bug.
 */
/** Fields the card needs to be drawn but the engine never reads. */
const card = (name: string) => ({
  url: `/ko/${name}/`, icon: '⊡', accent: '#57c7a2', kind: '도구', action: '도구 열기',
});

const entries: SearchEntry[] = [
  {
    title: '사진 자르기', name: 'image-crop', desc: '사진에서 원하는 부분만 잘라냅니다.',
    keywords: ['사진 자르기', '이미지 자르기', '증명사진 자르기'], ...card('image-crop'),
  },
  {
    title: '이미지 변환', name: 'image-converter', desc: 'JPG·PNG·WebP를 서로 바꿉니다.',
    keywords: ['이미지 변환', '사진 확장자 변환'], ...card('image-converter'),
  },
  {
    title: 'PNG를 JPG로', name: 'png-to-jpg', desc: 'PNG 이미지를 JPG로 바꿔 용량을 줄입니다.',
    keywords: ['png jpg 변환'], ...card('png-to-jpg'),
  },
  {
    title: '사다리타기', name: 'ladder', desc: '순서와 역할을 무작위로 정합니다.',
    keywords: ['사다리타기', '제비뽑기'], ...card('ladder'),
  },
  {
    title: 'PDF 합치기', name: 'merge-pdf', desc: '여러 PDF를 한 파일로 합칩니다.',
    keywords: ['PDF 합치기'], ...card('merge-pdf'),
  },
];

const top = (query: string) => searchEntries(entries, query)[0]?.entry.name;
const ruleFor = (query: string) => searchEntries(entries, query)[0]?.rule;

test('normalization ignores case, spacing and separators', () => {
  assert.equal(normalize('PNG to JPG'), 'pngtojpg');
  assert.equal(normalize('png-to-jpg'), 'pngtojpg');
  assert.equal(normalize('  Image · Crop  '), 'imagecrop');
});

test('a Korean query finds its tool by prefix and by fragment', () => {
  assert.equal(top('사진 자'), 'image-crop');
  assert.equal(top('자르'), 'image-crop');
});

test('an English slug is reachable from a Korean page', () => {
  assert.equal(top('png to jpg'), 'png-to-jpg');
  assert.equal(ruleFor('png-to-jpg'), 'exact');
});

test('word order decides which direction of a pair wins', () => {
  // Both slugs hold the same three words, so per-word scoring ties them and the
  // wrong direction used to win on alphabetical order alone.
  assert.equal(top('png to jpg'), 'png-to-jpg');
  assert.equal(ruleFor('png to jpg'), 'exact');
});

test('initials find the tool', () => {
  assert.equal(chosungOf('사다리타기'), 'ㅅㄷㄹㅌㄱ');
  assert.equal(top('ㅅㄷㄹ'), 'ladder');
  assert.equal(ruleFor('ㅅㄷㄹ'), 'chosung');
});

test('a half-typed syllable still matches', () => {
  assert.equal(jamoOf('사진'), 'ㅅㅏㅈㅣㄴ');
  assert.equal(top('사진 자르ㄱ'), 'image-crop');
});

test('a word typed without switching the IME is corrected', () => {
  assert.equal(layoutJamo('tkekfl'), 'ㅅㅏㄷㅏㄹㅣ');
  // A query with no Latin in it has nothing to re-key, and says so.
  assert.equal(layoutJamo('사다리'), '');
  assert.equal(top('tkekfl'), 'ladder');
});

test('a related word reaches a tool that never says it', () => {
  // "크롭" appears in no title, slug, description or keyword.
  assert.ok(!entries.some((entry) => JSON.stringify(entry).includes('크롭')));
  assert.equal(top('크롭'), 'image-crop');
  assert.equal(ruleFor('크롭'), 'synonym');
});

test('every space-separated word has to match', () => {
  assert.equal(searchEntries(entries, 'png 합치기').length, 0);
  assert.ok(searchEntries(entries, 'pdf 합치기').length > 0);
});

test('an empty or blank query returns nothing rather than everything', () => {
  assert.deepEqual(searchEntries(entries, ''), []);
  assert.deepEqual(searchEntries(entries, '   '), []);
});

test('a query that matches nothing returns nothing', () => {
  assert.deepEqual(searchEntries(entries, 'zzzzz'), []);
});

test('an exact title outranks a page that merely mentions it', () => {
  const hits = searchEntries(entries, '이미지 변환');
  assert.equal(hits[0].entry.name, 'image-converter');
  assert.ok(hits.length > 1, 'the pair page should still be listed, just lower');
});

test('the same query always produces the same order', () => {
  const once = searchEntries(entries, '사진').map((hit) => hit.entry.name);
  const twice = searchEntries([...entries].reverse(), '사진').map((hit) => hit.entry.name);
  assert.deepEqual(once, twice);
});

test('the limit is honoured', () => {
  assert.equal(searchEntries(entries, '사진', { limit: 1 }).length, 1);
});
