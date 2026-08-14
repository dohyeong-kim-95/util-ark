import assert from 'node:assert/strict';
import test from 'node:test';

import {
  PageSelectionError,
  formatPages,
  invertPages,
  normalizeRotation,
  pageFileName,
  parsePages,
} from '../src/lib/pdf-pages.ts';

/* ---------- reading a selection ---------- */

test('single pages, ranges, and a mixture all parse', () => {
  assert.deepEqual(parsePages('7', 20), [7]);
  assert.deepEqual(parsePages('1-3', 20), [1, 2, 3]);
  assert.deepEqual(parsePages('1-3, 7, 9-11', 20), [1, 2, 3, 7, 9, 10, 11]);
});

test('the ways people actually type it are accepted', () => {
  const expected = [1, 2, 3, 7];
  // Extra spaces, no spaces, spaces instead of commas, a trailing comma.
  assert.deepEqual(parsePages('  1 - 3 ,   7 ', 20), expected);
  assert.deepEqual(parsePages('1-3,7', 20), expected);
  assert.deepEqual(parsePages('1-3 7', 20), expected);
  assert.deepEqual(parsePages('1-3, 7,', 20), expected);
});

test('a dash pasted from a document still means "to"', () => {
  // Word turns a hyphen into an en dash; a Korean keyboard offers the wave dash.
  for (const dash of ['-', '–', '—', '~']) {
    assert.deepEqual(parsePages(`2${dash}4`, 20), [2, 3, 4], `failed on "${dash}"`);
  }
});

test('a backwards range is read the way it was meant', () => {
  assert.deepEqual(parsePages('7-3', 20), [3, 4, 5, 6, 7]);
});

test('overlapping parts are counted once, in order', () => {
  assert.deepEqual(parsePages('1-5, 3-7', 20), [1, 2, 3, 4, 5, 6, 7]);
  assert.deepEqual(parsePages('9, 9, 9', 20), [9]);
});

test('a selection is always sorted, never a reordering instruction', () => {
  // "5-7, 1" asks for four pages. Taking it as an order would move page one to
  // the end, which silently rewrites a document someone only meant to trim.
  assert.deepEqual(parsePages('5-7, 1', 20), [1, 5, 6, 7]);
});

test('a page outside the document is refused with the count in the message', () => {
  assert.throws(() => parsePages('21', 20), (error: PageSelectionError) => {
    assert.equal(error.reason, 'out-of-range');
    assert.match(error.message, /20/u);
    return true;
  });
  assert.throws(() => parsePages('0', 20), (error: PageSelectionError) => {
    assert.equal(error.reason, 'out-of-range');
    return true;
  });
  assert.throws(() => parsePages('18-25', 20), (error: PageSelectionError) => {
    assert.equal(error.reason, 'out-of-range');
    return true;
  });
});

test('nonsense is refused rather than half-read', () => {
  for (const input of ['abc', '1-2-3', '1;2', '-', '3-']) {
    assert.throws(() => parsePages(input, 20), (error: PageSelectionError) => {
      assert.equal(error.reason, 'unparsable', `"${input}" gave ${error.reason}`);
      return true;
    });
  }
});

test('an empty selection is its own case', () => {
  for (const input of ['', '   ', ',', ' , ']) {
    assert.throws(() => parsePages(input, 20), (error: PageSelectionError) => {
      assert.equal(error.reason, 'empty');
      return true;
    });
  }
});

/* ---------- writing one back ---------- */

test('a selection reads back as the text someone would have typed', () => {
  assert.equal(formatPages([1, 2, 3, 7, 9, 10, 11]), '1-3, 7, 9-11');
  assert.equal(formatPages([5]), '5');
  assert.equal(formatPages([]), '');
});

test('two consecutive pages are listed rather than ranged', () => {
  // "4-5" is longer than "4, 5" and reads as though something was collapsed.
  assert.equal(formatPages([4, 5]), '4, 5');
  assert.equal(formatPages([4, 5, 6]), '4-6');
});

test('what is parsed formats back to the same thing', () => {
  for (const input of ['1-3, 7, 9-11', '2', '1, 3, 5', '1-20']) {
    assert.equal(formatPages(parsePages(input, 20)), input);
  }
});

/* ---------- deleting instead of keeping ---------- */

test('deleting pages keeps everything else, in order', () => {
  assert.deepEqual(invertPages([2, 4], 6), [1, 3, 5, 6]);
  assert.deepEqual(invertPages([], 3), [1, 2, 3]);
  assert.deepEqual(invertPages([1, 2, 3], 3), []);
});

/* ---------- rotation ---------- */

test('rotation wraps instead of running past a full turn', () => {
  assert.equal(normalizeRotation(0), 0);
  assert.equal(normalizeRotation(90), 90);
  assert.equal(normalizeRotation(360), 0);
  // A page already at 270, turned once more, has to land on 0 — some readers
  // ignore a rotation of 360.
  assert.equal(normalizeRotation(270 + 90), 0);
  assert.equal(normalizeRotation(-90), 270);
  assert.equal(normalizeRotation(-450), 270);
});

/* ---------- names ---------- */

test('exported pages are named so a file browser sorts them correctly', () => {
  // Without padding, "report-10" sorts before "report-2".
  assert.equal(pageFileName('report.pdf', 2, 12, 'png'), 'report-02.png');
  assert.equal(pageFileName('report.pdf', 12, 12, 'png'), 'report-12.png');
  assert.equal(pageFileName('report.pdf', 7, 100, 'jpg'), 'report-007.jpg');
  assert.equal(pageFileName('report.pdf', 3, 9, 'pdf'), 'report-3.pdf');
});

test('a name with dots keeps everything but the extension', () => {
  assert.equal(pageFileName('2026.08 회의록.pdf', 1, 3, 'png'), '2026.08 회의록-1.png');
});
