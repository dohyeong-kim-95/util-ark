/**
 * Turns a PDF's text layer into something worth listening to.
 *
 * Pulling the strings out is the easy half — `getTextContent()` does it. The
 * work is that a PDF stores glyphs at coordinates, not sentences: a line arrives
 * as a dozen fragments, two-column pages come back interleaved, and the running
 * header repeats on every page. Read aloud, that comes out as
 * "…라고 했습니다 12 Utilark 그러나…".
 *
 * The layout half is deliberately separate from pdf.js and takes plain numbers,
 * so every rule below is exercised by tests rather than only by ear.
 */

export type PdfItem = {
  str: string;
  /** Left edge, in PDF units, origin bottom-left. */
  x: number;
  /** Baseline, in PDF units, growing upward. */
  y: number;
  width: number;
  /** Glyph height, which stands in for the font size. */
  height: number;
};

export type PdfPage = { width: number; height: number; items: PdfItem[] };

export class PdfError extends Error {
  readonly reason: 'no-text-layer' | 'encrypted' | 'invalid' | 'unreadable';

  constructor(reason: PdfError['reason'], message: string) {
    super(message);
    this.name = 'PdfError';
    this.reason = reason;
  }
}

type Line = { text: string; y: number; minX: number; maxX: number; height: number };

/**
 * The lower median, so that with an even count the smaller of the two middles
 * wins. Line gaps are compared against this to find paragraph breaks, and the
 * typical gap has to stay below the occasional wide one for that to work.
 */
const median = (values: number[]): number => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor((sorted.length - 1) / 2)];
};

/** Sentence-final punctuation in both scripts, plus the closing quotes that follow it. */
const SENTENCE_END = /[.!?。．！？…][)\]}"'”’」』]*$/u;

/**
 * A line is every item sharing a baseline. PDFs rarely place them at exactly the
 * same y — superscripts, inline maths and font changes shift it slightly — so
 * items within a fraction of the text height count as the same line.
 */
function toLines(items: PdfItem[]): Line[] {
  const usable = items.filter((item) => item.str.trim().length);
  if (!usable.length) return [];
  const typical = median(usable.map((item) => item.height).filter(Boolean)) || 10;

  const rows: PdfItem[][] = [];
  for (const item of [...usable].sort((a, b) => b.y - a.y || a.x - b.x)) {
    const row = rows[rows.length - 1];
    // Measured against the taller of the two, because a superscript footnote
    // marker sits above the baseline by a fraction of the *body* size, not of
    // its own. Line leading is at least 1.0x the body size, so 0.6x cannot
    // reach the next line.
    const allowance = row ? Math.max(...row.map((entry) => entry.height), item.height, typical) * 0.6 : 0;
    if (row && Math.abs(row[0].y - item.y) <= allowance) row.push(item);
    else rows.push([item]);
  }

  return rows.map((row) => {
    const sorted = [...row].sort((a, b) => a.x - b.x);
    let text = '';
    let previous: PdfItem | null = null;
    for (const item of sorted) {
      if (previous) {
        const gap = item.x - (previous.x + previous.width);
        const size = previous.height || typical;
        // Word spacing is often drawn as a gap rather than a space character.
        // A quarter of the font size separates "한 단어" from two words without
        // splitting kerned pairs.
        const spaced = /\s$/u.test(text) || /^\s/u.test(item.str);
        if (!spaced && gap > size * 0.25) text += ' ';
      }
      text += item.str;
      previous = item;
    }
    const heights = sorted.map((item) => item.height).filter(Boolean);
    // The tallest item carries the body baseline; a superscript would put the
    // line a few points too high and skew every gap measured from it.
    const anchor = sorted.reduce((tallest, item) => (item.height > tallest.height ? item : tallest), sorted[0]);
    return {
      text: text.replace(/\s+/gu, ' ').trim(),
      y: anchor.y,
      minX: Math.min(...sorted.map((item) => item.x)),
      maxX: Math.max(...sorted.map((item) => item.x + item.width)),
      height: median(heights) || typical,
    };
  }).filter((line) => line.text.length);
}

/**
 * Finds the gutter of a two-column page, or nothing. Reading a two-column paper
 * in coordinate order alternates between the columns sentence by sentence, which
 * is unlistenable, so this is worth getting right — but a wrong split is worse
 * than none, hence the deliberately narrow acceptance.
 *
 * A full-width title or a table crossing the gutter is expected; those lines are
 * kept in place and only the lines beside them are reordered.
 */
function findGutter(items: PdfItem[], pageWidth: number): number | null {
  const usable = items.filter((item) => item.str.trim().length);
  if (usable.length < 8) return null;
  const margin = pageWidth * 0.02;
  let best: { at: number; crossings: number } | null = null;

  for (let fraction = 0.35; fraction <= 0.65; fraction += 0.01) {
    const at = pageWidth * fraction;
    let crossings = 0;
    const left = new Set<number>();
    const right = new Set<number>();
    for (const item of usable) {
      if (item.x < at - margin && item.x + item.width > at + margin) crossings += 1;
      else if (item.x + item.width <= at) left.add(Math.round(item.y));
      else right.add(Math.round(item.y));
    }
    // Both columns must carry several lines of their own, and only a few items
    // may span the page. A one-column page fails this on the first count: every
    // full-width line crosses the middle.
    if (left.size < 3 || right.size < 3) continue;
    if (crossings > usable.length * 0.2) continue;
    if (!best || crossings < best.crossings) best = { at, crossings };
  }
  return best ? best.at : null;
}

/**
 * Left column then right, with page-spanning lines holding their place.
 *
 * The split has to happen before items are grouped into lines, because the two
 * columns share baselines: "왼쪽 첫 줄" and "오른쪽 첫 줄" sit at the same y, and
 * grouping by y first would weld them into one line that then reads across the
 * gutter — exactly the sentence-by-sentence alternation this exists to prevent.
 */
function readingOrder(page: PdfPage): Line[] {
  const gutter = findGutter(page.items, page.width);
  if (gutter === null) return toLines(page.items);

  const margin = page.width * 0.02;
  const spanning: PdfItem[] = [];
  const left: PdfItem[] = [];
  const right: PdfItem[] = [];
  for (const item of page.items) {
    if (item.x < gutter - margin && item.x + item.width > gutter + margin) spanning.push(item);
    else if (item.x + item.width <= gutter) left.push(item);
    else right.push(item);
  }

  const spans = toLines(spanning);
  const leftLines = toLines(left);
  const rightLines = toLines(right);

  // A full-width line divides the page: everything above it belongs to the
  // columns above, everything below to the columns below.
  const out: Line[] = [];
  let ceiling = Number.POSITIVE_INFINITY;
  const band = (lines: Line[], floor: number) =>
    lines.filter((line) => line.y < ceiling && line.y > floor);

  for (const span of spans) {
    out.push(...band(leftLines, span.y), ...band(rightLines, span.y), span);
    ceiling = span.y;
  }
  out.push(...band(leftLines, Number.NEGATIVE_INFINITY), ...band(rightLines, Number.NEGATIVE_INFINITY));
  return out;
}

/** Digits vary per page, so they are what a repeated header is compared without. */
const shapeOf = (text: string) => text.replace(/\d+/gu, '#').replace(/\s+/gu, ' ').trim().toLowerCase();

/**
 * Drops running headers, footers and page numbers. They are identified by
 * repetition near the page edge rather than by position alone, so a document
 * whose first body line sits high on the page keeps it.
 */
function stripRunningHeads(pages: Line[][], heights: number[]): Line[][] {
  if (pages.length < 3) return pages;

  const counts = new Map<string, number>();
  const marginal = pages.map((lines, index) => {
    const height = heights[index] || 1;
    const edge = new Set<Line>();
    for (const line of lines) {
      if (line.y > height * 0.92 || line.y < height * 0.08) edge.add(line);
    }
    for (const shape of new Set(Array.from(edge, (line) => shapeOf(line.text)))) {
      counts.set(shape, (counts.get(shape) ?? 0) + 1);
    }
    return edge;
  });

  const threshold = Math.max(3, Math.ceil(pages.length * 0.5));
  const repeated = new Set(
    Array.from(counts.entries()).filter(([, count]) => count >= threshold).map(([shape]) => shape),
  );
  if (!repeated.size) return pages;

  return pages.map((lines, index) =>
    lines.filter((line) => !(marginal[index].has(line) && repeated.has(shapeOf(line.text)))));
}

/**
 * Joins wrapped lines back into paragraphs. A soft wrap is invisible in the
 * file — it is just the next line — so the vertical gap is the only evidence of
 * a real break.
 */
function joinLines(lines: Line[]): string {
  if (!lines.length) return '';
  const gaps: number[] = [];
  for (let index = 1; index < lines.length; index += 1) {
    const gap = lines[index - 1].y - lines[index].y;
    if (gap > 0) gaps.push(gap);
  }
  const normalGap = median(gaps) || lines[0].height * 1.2;

  let out = lines[0].text;
  for (let index = 1; index < lines.length; index += 1) {
    const previous = lines[index - 1];
    const line = lines[index];
    const gap = previous.y - line.y;
    // Going back up the page means the next column started. A paragraph often
    // runs over that break, so it is only a break if the column ended a
    // sentence.
    const paragraph = gap < 0 ? SENTENCE_END.test(previous.text) : gap > normalGap * 1.6;

    if (paragraph) { out += `\n\n${line.text}`; continue; }
    // A word broken across a line break is hyphenated in the file but is one
    // word when spoken.
    if (/[A-Za-z]-$/u.test(out) && /^[a-z]/u.test(line.text)) {
      out = `${out.slice(0, -1)}${line.text}`;
      continue;
    }
    out += ` ${line.text}`;
  }
  return out;
}

/**
 * Assembles the whole document. Exported on its own so the rules above can be
 * tested with plain numbers, without a PDF or a browser in the way.
 */
export function layoutPages(pages: PdfPage[]): string {
  const perPage = pages.map((page) => readingOrder(page));
  const cleaned = stripRunningHeads(perPage, pages.map((page) => page.height));

  let out = '';
  for (const lines of cleaned) {
    const text = joinLines(lines);
    if (!text) continue;
    if (!out) { out = text; continue; }
    // A sentence running over a page break is still one sentence; only start a
    // new paragraph when the previous page actually finished one.
    out += SENTENCE_END.test(out.trimEnd()) ? `\n\n${text}` : ` ${text}`;
  }

  return out
    .replace(/[ \t]+/gu, ' ')
    .replace(/\n{3,}/gu, '\n\n')
    .trim();
}

/** Below this, a PDF is a picture of a document rather than a document. */
const MIN_CHARS_PER_PAGE = 12;

export type PdfProgress = (done: number, total: number) => void;

/**
 * Reads a PDF's text layer. Never runs OCR: a scanned page holds an image and no
 * text, and this reports that rather than returning silence.
 */
export async function pdfToText(data: ArrayBuffer, onProgress?: PdfProgress): Promise<string> {
  const pdfjs = await import('pdfjs-dist');
  const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

  const loading = pdfjs.getDocument({
    data,
    // Korean PDFs written against a predefined CJK encoding carry no ToUnicode
    // table, and without the matching CMap their text extracts as mojibake. The
    // files are served from this site, not a CDN — the PDF itself still goes
    // nowhere, and pdf.js fetches only the one encoding a file asks for.
    // `standardFontDataUrl` and `wasmUrl` are deliberately left unset: they
    // matter for drawing a page, not for reading it, and unset means pdf.js has
    // nowhere to fetch from.
    cMapUrl: '/cmaps/',
    cMapPacked: true,
  });

  let document;
  try {
    document = await loading.promise;
  } catch (error) {
    const name = (error as { name?: string })?.name;
    if (name === 'PasswordException') {
      throw new PdfError('encrypted', 'The PDF is password protected.');
    }
    if (name === 'InvalidPDFException') throw new PdfError('invalid', 'The file is not a PDF.');
    throw new PdfError('unreadable', 'The PDF could not be opened.');
  }

  try {
    const pages: PdfPage[] = [];
    for (let number = 1; number <= document.numPages; number += 1) {
      const page = await document.getPage(number);
      const viewport = page.getViewport({ scale: 1 });
      const content = await page.getTextContent();
      pages.push({
        width: viewport.width,
        height: viewport.height,
        items: content.items.flatMap((item) => {
          if (!('str' in item)) return [];
          const transform = item.transform as number[];
          return [{
            str: item.str,
            x: transform[4],
            y: transform[5],
            width: item.width,
            height: item.height || Math.abs(transform[3]) || 10,
          }];
        }),
      });
      page.cleanup();
      onProgress?.(number, document.numPages);
    }

    const text = layoutPages(pages);
    if (text.replace(/\s/gu, '').length < pages.length * MIN_CHARS_PER_PAGE) {
      throw new PdfError('no-text-layer', 'The PDF has no text layer.');
    }
    return text;
  } finally {
    // Tears down the worker too, so a second file does not stack another one.
    await loading.destroy();
  }
}
