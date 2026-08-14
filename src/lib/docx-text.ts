/**
 * Pulls the visible text out of a .docx, in the browser, with no dependency.
 *
 * A .docx is a ZIP holding XML parts, and the browser can already do both jobs:
 * `DecompressionStream('deflate-raw')` inflates, `DOMParser` reads the XML. The
 * usual libraries for this are 20 to 134KB gzipped; the only thing they add here
 * is a ZIP directory walk, which is a hundred lines.
 *
 * Only the main document body is read. Headers, footers, footnotes and comments
 * live in separate parts and are left out on purpose — someone checking whether
 * an application fits a character limit means the body they wrote.
 */

const W_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const DOCUMENT_PART = 'word/document.xml';

const EOCD_SIGNATURE = 0x06054b50;
const CENTRAL_SIGNATURE = 0x02014b50;
const LOCAL_SIGNATURE = 0x04034b50;
const ZIP64_MARKER = 0xffffffff;

export class DocxError extends Error {
  /** Lets the caller pick a translated message instead of showing this one. */
  readonly reason: 'not-a-zip' | 'not-a-docx' | 'unsupported-zip' | 'unreadable';

  constructor(reason: DocxError['reason'], message: string) {
    super(message);
    this.name = 'DocxError';
    this.reason = reason;
  }
}

/** The end-of-central-directory record sits last, behind an optional comment. */
function findEndOfCentralDirectory(view: DataView): number {
  const min = Math.max(0, view.byteLength - 0xffff - 22);
  for (let at = view.byteLength - 22; at >= min; at -= 1) {
    if (view.getUint32(at, true) === EOCD_SIGNATURE) return at;
  }
  throw new DocxError('not-a-zip', 'No ZIP end-of-central-directory record.');
}

type Entry = { offset: number; compressedSize: number; method: number };

function findEntry(buffer: ArrayBuffer, wanted: string): Entry {
  const view = new DataView(buffer);
  const eocd = findEndOfCentralDirectory(view);
  const count = view.getUint16(eocd + 10, true);
  let at = view.getUint32(eocd + 16, true);
  if (at === ZIP64_MARKER || count === 0xffff) {
    throw new DocxError('unsupported-zip', 'ZIP64 archives are not supported.');
  }

  const names = new TextDecoder();
  for (let index = 0; index < count; index += 1) {
    if (at + 46 > view.byteLength || view.getUint32(at, true) !== CENTRAL_SIGNATURE) {
      throw new DocxError('not-a-zip', 'Central directory is truncated.');
    }
    const method = view.getUint16(at + 10, true);
    const compressedSize = view.getUint32(at + 20, true);
    const nameLength = view.getUint16(at + 28, true);
    const extraLength = view.getUint16(at + 30, true);
    const commentLength = view.getUint16(at + 32, true);
    const offset = view.getUint32(at + 42, true);
    const name = names.decode(new Uint8Array(buffer, at + 46, nameLength));
    if (name === wanted) {
      if (compressedSize === ZIP64_MARKER || offset === ZIP64_MARKER) {
        throw new DocxError('unsupported-zip', 'ZIP64 archives are not supported.');
      }
      return { offset, compressedSize, method };
    }
    at += 46 + nameLength + extraLength + commentLength;
  }
  throw new DocxError('not-a-docx', `The archive has no ${wanted}.`);
}

async function inflate(bytes: Uint8Array): Promise<Uint8Array> {
  // Present in every browser this site targets, but a page must not throw a
  // ReferenceError at an old one — the caller turns this into a plain sentence.
  if (typeof DecompressionStream === 'undefined') {
    throw new DocxError('unreadable', 'This browser cannot decompress the file.');
  }
  const stream = new Blob([bytes as BlobPart]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function readPart(buffer: ArrayBuffer, name: string): Promise<string> {
  const entry = findEntry(buffer, name);
  const view = new DataView(buffer);
  if (view.getUint32(entry.offset, true) !== LOCAL_SIGNATURE) {
    throw new DocxError('not-a-zip', 'Local file header is missing.');
  }
  // The local header repeats the name and extra field at its own lengths, which
  // need not match the central directory's, so both are read again here.
  const start = entry.offset + 30
    + view.getUint16(entry.offset + 26, true)
    + view.getUint16(entry.offset + 28, true);
  const compressed = new Uint8Array(buffer, start, entry.compressedSize);

  if (entry.method === 0) return new TextDecoder().decode(compressed);
  if (entry.method !== 8) {
    throw new DocxError('unsupported-zip', `Compression method ${entry.method} is not supported.`);
  }
  return new TextDecoder().decode(await inflate(compressed));
}

const ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'",
};

function decodeEntities(value: string): string {
  if (!value.includes('&')) return value;
  return value.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/giu, (whole, body: string) => {
    if (body[0] === '#') {
      const code = body[1] === 'x' || body[1] === 'X'
        ? Number.parseInt(body.slice(2), 16)
        : Number.parseInt(body.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : whole;
    }
    return ENTITIES[body.toLowerCase()] ?? whole;
  });
}

type Tag = { kind: 'open' | 'close' | 'self'; name: string; raw: string };
type Token = Tag | { kind: 'text'; value: string };

/**
 * Enough of an XML scanner for one OOXML part: elements, text and entities.
 * `DOMParser` would do this, but it exists only in the browser, and a parser the
 * tests cannot run is a parser nothing checks. The subset is small and the
 * awkward cases are covered — quoted `>` inside an attribute, comments,
 * declarations and CDATA.
 */
function* tokenize(xml: string): Generator<Token> {
  let at = 0;
  while (at < xml.length) {
    const next = xml.indexOf('<', at);
    if (next === -1) {
      if (at < xml.length) yield { kind: 'text', value: xml.slice(at) };
      return;
    }
    if (next > at) yield { kind: 'text', value: xml.slice(at, next) };

    if (xml.startsWith('<!--', next)) {
      const end = xml.indexOf('-->', next);
      at = end === -1 ? xml.length : end + 3;
      continue;
    }
    if (xml.startsWith('<![CDATA[', next)) {
      const end = xml.indexOf(']]>', next);
      const stop = end === -1 ? xml.length : end;
      yield { kind: 'text', value: xml.slice(next + 9, stop) };
      at = end === -1 ? xml.length : end + 3;
      continue;
    }
    if (xml.startsWith('<?', next) || xml.startsWith('<!', next)) {
      const end = xml.indexOf('>', next);
      at = end === -1 ? xml.length : end + 1;
      continue;
    }

    // An attribute value may hold a `>`, so the tag ends at the first `>` that
    // is not inside quotes.
    let cursor = next + 1;
    let quote = '';
    while (cursor < xml.length) {
      const ch = xml[cursor];
      if (quote) { if (ch === quote) quote = ''; }
      else if (ch === '"' || ch === "'") quote = ch;
      else if (ch === '>') break;
      cursor += 1;
    }
    if (cursor >= xml.length) throw new DocxError('not-a-docx', 'A tag is unterminated.');

    const raw = xml.slice(next + 1, cursor);
    const close = raw.startsWith('/');
    const self = raw.endsWith('/');
    const name = raw.slice(close ? 1 : 0).split(/[\s/]/u)[0];
    if (!name) throw new DocxError('not-a-docx', 'A tag has no name.');
    yield { kind: close ? 'close' : self ? 'self' : 'open', name, raw };
    at = cursor + 1;
  }
}

/**
 * Word always writes the `w:` prefix, but the prefix is a choice the file makes,
 * so it is read from the root rather than assumed. Getting this right is what
 * keeps DrawingML's `<a:t>` and math's `<m:t>` out of the count.
 */
function wordPrefix(raw: string): string {
  const match = new RegExp(`xmlns:([\\w.-]+)\\s*=\\s*["']${W_NS}["']`, 'u').exec(raw);
  return match ? match[1] : 'w';
}

/**
 * Walks the body in document order. Word starts a new run at every formatting
 * change, so a sentence with one bold word arrives as three runs and has to be
 * stitched back together rather than read element by element.
 */
function textOf(xml: string): string {
  // Field codes are instructions ("PAGE \* MERGEFORMAT"), and deleted text is
  // struck through in a tracked-changes document. Neither is writing that counts
  // toward a limit, so their contents are dropped rather than collected.
  const DROP = new Set(['instrText', 'delText', 'delInstrText']);

  const out: string[] = [];
  const stack: Array<{ local: string; word: boolean }> = [];
  let prefix = 'w';
  let sawBody = false;
  let inBody = false;
  /** Stack height at which a dropped element opened, or -1 when collecting. */
  let dropAt = -1;
  let inText = false;

  for (const token of tokenize(xml)) {
    if (token.kind === 'text') {
      if (inBody && inText && dropAt === -1) out.push(decodeEntities(token.value));
      continue;
    }

    const colon = token.name.indexOf(':');
    const local = colon === -1 ? token.name : token.name.slice(colon + 1);

    if (token.kind === 'close') {
      const open = stack.pop();
      if (dropAt !== -1 && stack.length <= dropAt) dropAt = -1;
      if (!open?.word) continue;
      if (open.local === 't') inText = false;
      else if (open.local === 'p' && inBody) out.push('\n');
      else if (open.local === 'body') inBody = false;
      continue;
    }

    // The root names the prefix bound to wordprocessingml. Read it before any
    // test that depends on `prefix`, since this is the tag that defines it.
    if (!stack.length && local === 'document') prefix = wordPrefix(token.raw);
    // An unprefixed name belongs to the default namespace, which in a Word
    // document part is never the wordprocessingml one.
    const isWord = colon !== -1 && token.name.slice(0, colon) === prefix;

    if (token.kind === 'open') stack.push({ local, word: isWord });
    if (!isWord) continue;

    if (local === 'body') { sawBody = true; inBody = true; continue; }
    if (!inBody) continue;

    if (DROP.has(local)) {
      if (token.kind === 'open' && dropAt === -1) dropAt = stack.length - 1;
      continue;
    }
    if (dropAt !== -1) continue;
    if (local === 't') inText = true;
    else if (local === 'tab') out.push('\t');
    else if (local === 'br' || local === 'cr') out.push('\n');
  }

  if (!sawBody) throw new DocxError('not-a-docx', 'The document has no body.');
  // Word ends the body with a final empty paragraph; a trailing blank line is an
  // artefact of the format rather than something the author typed.
  return out.join('').replace(/\n+$/u, '');
}

/** Reads a .docx and returns its body text. Throws `DocxError` on anything else. */
export async function docxToText(buffer: ArrayBuffer): Promise<string> {
  return textOf(await readPart(buffer, DOCUMENT_PART));
}
