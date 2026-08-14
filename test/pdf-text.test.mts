import assert from 'node:assert/strict';
import test from 'node:test';

import { layoutPages, type PdfItem, type PdfPage } from '../src/lib/pdf-text.ts';

/**
 * Pages are described the way a PDF stores them: glyph runs at coordinates, with
 * y growing upward from the bottom-left. Every rule in the layout pass exists
 * because reading these coordinates naively produces something wrong, so the
 * fixtures reproduce the wrong shape rather than the right one.
 */
const SIZE = 10;
const A4 = { width: 595, height: 842 };

/** One run of text on a line. `width` is derived so gaps are meaningful. */
const run = (str: string, x: number, y: number, size = SIZE): PdfItem =>
  ({ str, x, y, width: str.length * size * 0.5, height: size });

/** A whole line as a single run, which is what a simple PDF produces. */
const line = (str: string, y: number, x = 60) => run(str, x, y);

const page = (items: PdfItem[], box = A4): PdfPage => ({ ...box, items });

test('a line split into runs comes back as one line', () => {
  // A bolded word mid-sentence arrives as three runs at adjoining x positions.
  const items = [
    run('브라우저에서 ', 60, 700),
    run('바로', 60 + '브라우저에서 '.length * 5, 700),
    run(' 처리합니다.', 60 + '브라우저에서 바로'.length * 5, 700),
  ];
  assert.equal(layoutPages([page(items)]), '브라우저에서 바로 처리합니다.');
});

test('a wide gap between runs becomes a space', () => {
  // Many PDFs draw word spacing as a position jump with no space character.
  const items = [run('Hello', 60, 700), run('world', 60 + 5 * 5 + 8, 700)];
  assert.equal(layoutPages([page(items)]), 'Hello world');
});

test('runs that merely touch are not split by a phantom space', () => {
  const items = [run('Uti', 60, 700), run('lark', 60 + 3 * 5, 700)];
  assert.equal(layoutPages([page(items)]), 'Utilark');
});

test('a superscript does not start a new line', () => {
  const items = [run('각주가 있는 문장', 60, 700), run('1', 145, 704, 6)];
  assert.equal(layoutPages([page(items)]), '각주가 있는 문장 1');
});

test('wrapped lines rejoin, and a wide gap starts a new paragraph', () => {
  const items = [
    line('첫 문단의 첫 줄이고', 700),
    line('여기서 이어집니다.', 688),
    line('한 줄 띄운 다음 문단입니다.', 650),
  ];
  assert.equal(
    layoutPages([page(items)]),
    '첫 문단의 첫 줄이고 여기서 이어집니다.\n\n한 줄 띄운 다음 문단입니다.',
  );
});

test('a word hyphenated across a line break is rejoined', () => {
  const items = [line('This para- ', 700).str ? line('This para-', 700) : line('', 0), line('graph continues.', 688)];
  assert.equal(layoutPages([page(items)]), 'This paragraph continues.');
});

test('a hyphen that ends a real word is left alone', () => {
  const items = [line('The state-', 700), line('Owned company', 688)];
  // The next line starts with a capital, so it is not a broken word.
  assert.equal(layoutPages([page(items)]), 'The state- Owned company');
});

test('a sentence continuing over a page break stays one sentence', () => {
  const first = page([line('이 문장은 페이지를 넘어', 100)]);
  const second = page([line('계속됩니다.', 700)]);
  assert.equal(layoutPages([first, second]), '이 문장은 페이지를 넘어 계속됩니다.');
});

test('a page that ends a sentence starts a new paragraph', () => {
  const first = page([line('여기서 끝납니다.', 100)]);
  const second = page([line('새 쪽입니다.', 700)]);
  assert.equal(layoutPages([first, second]), '여기서 끝납니다.\n\n새 쪽입니다.');
});

/* ---------- two columns ---------- */

/** Twelve lines split into two columns, numbered so the order is visible. */
function twoColumnPage(extra: PdfItem[] = []): PdfPage {
  const items = [...extra];
  for (let row = 0; row < 6; row += 1) {
    const y = 700 - row * 14;
    items.push(run(`왼쪽${row}.`, 60, y));
    items.push(run(`오른쪽${row}.`, 330, y));
  }
  return page(items);
}

test('a two-column page reads down one column and then the other', () => {
  const out = layoutPages([twoColumnPage()]);
  const order = out.replace(/\n+/gu, ' ').split(' ');
  assert.deepEqual(order.slice(0, 6), ['왼쪽0.', '왼쪽1.', '왼쪽2.', '왼쪽3.', '왼쪽4.', '왼쪽5.']);
  assert.deepEqual(order.slice(6), ['오른쪽0.', '오른쪽1.', '오른쪽2.', '오른쪽3.', '오른쪽4.', '오른쪽5.']);
});

test('a full-width heading above two columns keeps its place', () => {
  const heading: PdfItem = { str: '전체 폭 제목', x: 60, y: 760, width: 475, height: 14 };
  const out = layoutPages([twoColumnPage([heading])]);
  assert.ok(out.startsWith('전체 폭 제목'), out.slice(0, 40));
  assert.ok(out.indexOf('왼쪽5.') < out.indexOf('오른쪽0.'), 'columns should not interleave');
});

test('a single-column page is never split', () => {
  const items = Array.from({ length: 12 }, (_ignored, row) => line(`${row}번째 줄입니다.`, 700 - row * 14));
  const out = layoutPages([page(items)]);
  const numbers = Array.from(out.matchAll(/(\d+)번째/gu), (match) => Number(match[1]));
  assert.deepEqual(numbers, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
});

/* ---------- running heads ---------- */

/** Six pages carrying the same header and a changing page number. */
const book = (bodies: string[]) =>
  bodies.map((body, index) =>
    page([
      line('제3장  검색이 동작하는 방식', 800),
      line(body, 500),
      line(`- ${index + 1} -`, 30),
    ]));

test('a repeated header and a page number are dropped', () => {
  const out = layoutPages(book([
    '첫째 쪽 본문입니다.', '둘째 쪽 본문입니다.', '셋째 쪽 본문입니다.',
    '넷째 쪽 본문입니다.', '다섯째 쪽 본문입니다.', '여섯째 쪽 본문입니다.',
  ]));
  assert.ok(!out.includes('제3장'), 'the running header should be gone');
  assert.ok(!/-\s*\d+\s*-/u.test(out), 'the page number should be gone');
  assert.ok(out.startsWith('첫째 쪽 본문입니다.'), out.slice(0, 30));
  assert.equal(out.split('\n\n').length, 6);
});

test('a short document keeps everything, since nothing has repeated yet', () => {
  const out = layoutPages(book(['첫째 쪽입니다.', '둘째 쪽입니다.']));
  assert.ok(out.includes('제3장'), 'two pages are not enough evidence of a running head');
});

test('a line near the top that is not repeated is body text', () => {
  const pages = book(['본문 하나.', '본문 둘.', '본문 셋.', '본문 넷.', '본문 다섯.', '본문 여섯.']);
  pages[2].items.push(line('이 쪽에만 있는 제목', 780));
  const out = layoutPages(pages);
  assert.ok(out.includes('이 쪽에만 있는 제목'), 'a one-off heading must survive');
  assert.ok(!out.includes('제3장'), 'the repeated one must not');
});

/* ---------- nothing to read ---------- */

test('a page with no text layer yields nothing rather than throwing', () => {
  // A scanned page holds an image and no text items at all. `pdfToText` turns
  // this into a "no text layer" message; the layout pass simply has no work.
  assert.equal(layoutPages([page([])]), '');
});

test('whitespace-only items are ignored', () => {
  assert.equal(layoutPages([page([run('   ', 60, 700), run('', 80, 700)])]), '');
});
