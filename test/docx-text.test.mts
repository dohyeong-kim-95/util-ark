import assert from 'node:assert/strict';
import { deflateRawSync, crc32 } from 'node:zlib';
import test from 'node:test';

import { DocxError, docxToText } from '../src/lib/docx-text.ts';

/**
 * Builds a real ZIP rather than mocking one. The reader walks byte offsets, and
 * a hand-written fixture would only prove it agrees with itself — this proves it
 * agrees with the format Word actually writes.
 */
function zip(files: Array<{ name: string; body: string; store?: boolean }>): ArrayBuffer {
  const parts: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const name = new TextEncoder().encode(file.name);
    const raw = new TextEncoder().encode(file.body);
    const data = file.store ? raw : new Uint8Array(deflateRawSync(raw));
    const method = file.store ? 0 : 8;
    const sum = crc32(Buffer.from(raw));

    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true);
    local.setUint16(8, method, true);
    local.setUint32(14, sum, true);
    local.setUint32(18, data.length, true);
    local.setUint32(22, raw.length, true);
    local.setUint16(26, name.length, true);
    parts.push(new Uint8Array(local.buffer), name, data);

    const dir = new DataView(new ArrayBuffer(46));
    dir.setUint32(0, 0x02014b50, true);
    dir.setUint16(4, 20, true);
    dir.setUint16(6, 20, true);
    dir.setUint16(10, method, true);
    dir.setUint32(16, sum, true);
    dir.setUint32(20, data.length, true);
    dir.setUint32(24, raw.length, true);
    dir.setUint16(28, name.length, true);
    dir.setUint32(42, offset, true);
    central.push(new Uint8Array(dir.buffer), name);

    offset += 30 + name.length + data.length;
  }

  const directory = central.reduce((total, part) => total + part.length, 0);
  const eocd = new DataView(new ArrayBuffer(22));
  eocd.setUint32(0, 0x06054b50, true);
  eocd.setUint16(8, files.length, true);
  eocd.setUint16(10, files.length, true);
  eocd.setUint32(12, directory, true);
  eocd.setUint32(16, offset, true);

  const all = [...parts, ...central, new Uint8Array(eocd.buffer)];
  const out = new Uint8Array(all.reduce((total, part) => total + part.length, 0));
  let at = 0;
  for (const part of all) { out.set(part, at); at += part.length; }
  return out.buffer;
}

const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const document = (body: string) =>
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
  `<w:document xmlns:w="${W}"><w:body>${body}</w:body></w:document>`;
const para = (...runs: string[]) => `<w:p>${runs.map((r) => `<w:r>${r}</w:r>`).join('')}</w:p>`;
const text = (value: string) => `<w:t xml:space="preserve">${value}</w:t>`;

/** A .docx also carries these; the reader must pick its part out of the middle. */
const docx = (body: string, opts: { store?: boolean } = {}) =>
  zip([
    { name: '[Content_Types].xml', body: '<Types/>' },
    { name: '_rels/.rels', body: '<Relationships/>' },
    { name: 'word/document.xml', body: document(body), store: opts.store },
    { name: 'word/styles.xml', body: '<w:styles/>' },
  ]);

test('reads the body of a deflated document', async () => {
  const out = await docxToText(docx(para(text('안녕하세요. 자기소개서입니다.'))));
  assert.equal(out, '안녕하세요. 자기소개서입니다.');
});

test('reads a stored (uncompressed) entry too', async () => {
  const out = await docxToText(docx(para(text('저장만 된 항목')), { store: true }));
  assert.equal(out, '저장만 된 항목');
});

test('stitches runs that Word split mid-sentence', async () => {
  // Word starts a new run at every formatting change, so a bolded word in the
  // middle of a sentence arrives as three runs.
  const out = await docxToText(docx(para(text('지원 '), text('동기'), text('를 씁니다'))));
  assert.equal(out, '지원 동기를 씁니다');
});

test('each paragraph becomes one line', async () => {
  const out = await docxToText(docx(para(text('첫 문단')) + para(text('둘째 문단'))));
  assert.equal(out, '첫 문단\n둘째 문단');
  assert.equal(out.split('\n').length, 2);
});

test('breaks and tabs survive, and the trailing empty paragraph does not', async () => {
  const body = para(text('위'), '<w:br/>', text('아래'), '<w:tab/>', text('탭')) + '<w:p/>';
  assert.equal(await docxToText(docx(body)), '위\n아래\t탭');
});

test('field codes and deleted text are left out of the count', async () => {
  const body = para(
    text('본문'),
    '<w:instrText>PAGE \\* MERGEFORMAT</w:instrText>',
    '<w:delText>지운 문장</w:delText>',
    text('만'),
  );
  assert.equal(await docxToText(docx(body)), '본문만');
});

test('a table cell reads as text', async () => {
  const body = `<w:tbl><w:tr><w:tc>${para(text('칸1'))}</w:tc><w:tc>${para(text('칸2'))}</w:tc></w:tr></w:tbl>`;
  assert.equal(await docxToText(docx(body)), '칸1\n칸2');
});

test('XML entities are decoded rather than counted as text', async () => {
  const out = await docxToText(docx(para(text('&lt;태그&gt; &amp; 기호'))));
  assert.equal(out, '<태그> & 기호');
});

test('a file that is not a ZIP is reported as such', async () => {
  const junk = new TextEncoder().encode('this is a plain text file, not a docx');
  await assert.rejects(() => docxToText(junk.buffer as ArrayBuffer), (error: DocxError) => {
    assert.equal(error.reason, 'not-a-zip');
    return true;
  });
});

test('a ZIP without a Word document is reported separately', async () => {
  const notWord = zip([{ name: 'xl/workbook.xml', body: '<workbook/>' }]);
  await assert.rejects(() => docxToText(notWord), (error: DocxError) => {
    assert.equal(error.reason, 'not-a-docx');
    return true;
  });
});

test('an empty document counts as empty rather than failing', async () => {
  assert.equal(await docxToText(docx('')), '');
});

test('a > inside an attribute value does not end the tag early', async () => {
  const body = `<w:p><w:r><w:rPr><w:rStyle w:val="a>b"/></w:rPr>${text('본문')}</w:r></w:p>`;
  assert.equal(await docxToText(docx(body)), '본문');
});

test('comments and processing instructions are skipped', async () => {
  const body = `<!-- 주석 <w:t>가짜</w:t> --><?ignore me?>${para(text('진짜'))}`;
  assert.equal(await docxToText(docx(body)), '진짜');
});

test('text from other namespaces is not counted', async () => {
  // `a:t` is DrawingML (chart and SmartArt labels) and `m:t` is math. Matching
  // on the local name alone would sweep both into the character count.
  const body = para(text('본문')) +
    '<w:p><w:r><mc:AlternateContent><a:t>차트 라벨</a:t></mc:AlternateContent></w:r></w:p>' +
    '<w:p><m:oMath><m:r><m:t>x+y</m:t></m:r></m:oMath></w:p>';
  assert.equal(await docxToText(docx(body)), '본문');
});

test('the wordprocessingml prefix is read from the file, not assumed', async () => {
  // Valid XML may bind the namespace to any prefix; Word writes `w:`, but a
  // document produced by another tool need not.
  const xml = `<?xml version="1.0"?><ns0:document xmlns:ns0="${W}"><ns0:body>` +
    `<ns0:p><ns0:r><ns0:t>다른 접두사</ns0:t></ns0:r></ns0:p>` +
    `</ns0:body></ns0:document>`;
  const file = zip([{ name: 'word/document.xml', body: xml }]);
  assert.equal(await docxToText(file), '다른 접두사');
});

test('a paragraph holding only a drawing adds a line but no characters', async () => {
  const body = para(text('위')) + '<w:p><w:r><w:drawing/></w:r></w:p>' + para(text('아래'));
  assert.equal(await docxToText(docx(body)), '위\n\n아래');
});
