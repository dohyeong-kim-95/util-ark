import assert from 'node:assert/strict';
import { crc32 as nodeCrc32 } from 'node:zlib';
import test from 'node:test';

import { crc32, writeZip } from '../src/lib/zip-write.ts';

/**
 * The writer is checked against two independent things rather than against
 * itself: Node's own CRC implementation, and the ZIP reader already in this
 * repository. A round trip through `docx-text.ts` is the strongest evidence
 * available here that the byte layout is right, because that reader was written
 * for archives Word produces, not for these.
 */

const bytes = (text: string) => new TextEncoder().encode(text);

test('the checksum agrees with an implementation nobody here wrote', () => {
  for (const sample of ['', 'a', 'utilark', '한글도 포함합니다', 'x'.repeat(5000)]) {
    assert.equal(crc32(bytes(sample)), nodeCrc32(Buffer.from(sample)), `differs on "${sample.slice(0, 12)}"`);
  }
});

test('a written archive reads back through this project\'s own ZIP reader', async () => {
  // The reader only extracts `word/document.xml`, so the fixture is shaped like
  // a .docx. That it round-trips means the local headers, the central directory
  // and the end record all agree.
  const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
  const xml = `<?xml version="1.0"?><w:document xmlns:w="${W}"><w:body>` +
    `<w:p><w:r><w:t>왕복 확인</w:t></w:r></w:p></w:body></w:document>`;

  const blob = writeZip([
    { name: '[Content_Types].xml', bytes: bytes('<Types/>') },
    { name: 'word/document.xml', bytes: bytes(xml) },
    { name: 'word/styles.xml', bytes: bytes('<w:styles/>') },
  ]);

  const { docxToText } = await import('../src/lib/docx-text.ts');
  assert.equal(await docxToText(await blob.arrayBuffer()), '왕복 확인');
});

test('the archive carries the signatures a ZIP is identified by', async () => {
  const view = new DataView(await writeZip([{ name: 'a.txt', bytes: bytes('hello') }]).arrayBuffer());
  assert.equal(view.getUint32(0, true), 0x04034b50, 'local file header');
  // The end-of-central-directory record is the last twenty-two bytes.
  assert.equal(view.getUint32(view.byteLength - 22, true), 0x06054b50, 'end of central directory');
  assert.equal(view.getUint16(view.byteLength - 22 + 10, true), 1, 'entry count');
});

test('entries are stored rather than deflated', async () => {
  // PDFs and PNGs are already compressed; deflating them again would cost the
  // work and save almost nothing.
  const view = new DataView(await writeZip([{ name: 'a.txt', bytes: bytes('hello') }]).arrayBuffer());
  assert.equal(view.getUint16(8, true), 0, 'compression method must be "stored"');
  assert.equal(view.getUint32(18, true), 5, 'compressed size equals the input');
  assert.equal(view.getUint32(22, true), 5, 'uncompressed size equals the input');
});

test('names are flagged as UTF-8, so Korean filenames survive Explorer', async () => {
  const view = new DataView(await writeZip([{ name: '회의록-1.png', bytes: bytes('x') }]).arrayBuffer());
  // Bit 11 of the general purpose flags.
  assert.equal(view.getUint16(6, true) & 0x0800, 0x0800);
});

test('the blob announces itself as a ZIP', () => {
  assert.equal(writeZip([{ name: 'a.txt', bytes: bytes('x') }]).type, 'application/zip');
});

test('an empty archive is refused rather than written', () => {
  assert.throws(() => writeZip([]), /at least one entry/u);
});

test('a name that would escape the archive is refused, not quietly rewritten', () => {
  // Renaming someone's file without saying so is worse than declining.
  for (const name of ['../escape.png', '/absolute.png', 'sub\\dir.png', '']) {
    assert.throws(() => writeZip([{ name, bytes: bytes('x') }]), /name/u, `accepted "${name}"`);
  }
});

test('a folder inside the archive is allowed', () => {
  assert.doesNotThrow(() => writeZip([{ name: 'pages/1.png', bytes: bytes('x') }]));
});

test('many entries all land in the directory', async () => {
  const entries = Array.from({ length: 50 }, (_unused, index) => ({
    name: `page-${index}.txt`,
    bytes: bytes(`page ${index}`),
  }));
  const buffer = await writeZip(entries).arrayBuffer();
  const view = new DataView(buffer);
  assert.equal(view.getUint16(view.byteLength - 22 + 10, true), 50);

  // Every entry's central-directory record has to be present and findable.
  const directoryAt = view.getUint32(view.byteLength - 22 + 16, true);
  let at = directoryAt;
  for (let index = 0; index < 50; index += 1) {
    assert.equal(view.getUint32(at, true), 0x02014b50, `entry ${index} header`);
    at += 46 + view.getUint16(at + 28, true) + view.getUint16(at + 30, true) + view.getUint16(at + 32, true);
  }
  assert.equal(at, view.byteLength - 22, 'the directory must end where the record begins');
});
