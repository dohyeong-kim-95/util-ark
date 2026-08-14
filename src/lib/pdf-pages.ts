/**
 * Reading and writing page selections — "1-3, 7, 9-12" — and the small rules
 * around them.
 *
 * Nobody clicks a hundred thumbnails. Typing a range is how this job is actually
 * done, so the parser has to survive the ways people really write one: a stray
 * space, an en dash pasted from a document, a range given backwards, a page that
 * does not exist.
 */

export class PageSelectionError extends Error {
  readonly reason: 'unparsable' | 'out-of-range' | 'empty';

  constructor(reason: PageSelectionError['reason'], message: string) {
    super(message);
    this.name = 'PageSelectionError';
    this.reason = reason;
  }
}

/** Word processors and Korean keyboards produce all of these for "to". */
const DASHES = /[-–—~]/u;

/**
 * Returns 1-based page numbers, in order, without duplicates. Order is imposed
 * deliberately: "5-7, 1" means those four pages, not an instruction to move page
 * one to the end. Reordering pages is a different tool, and quietly doing it
 * here would corrupt a document someone only meant to trim.
 */
export function parsePages(input: string, pageCount: number): number[] {
  const text = String(input ?? '').trim();
  if (!text) throw new PageSelectionError('empty', 'No pages were given.');

  const chosen = new Set<number>();
  // Spaces around a dash have to close up first. Splitting "1 - 3" on
  // whitespace otherwise leaves a lone "-" as its own part.
  const tightened = text.replace(/\s*([-–—~])\s*/gu, '$1');
  for (const rawPart of tightened.split(/[,\s]+/u)) {
    const part = rawPart.trim();
    if (!part) continue;

    const bounds = part.split(DASHES).map((piece) => piece.trim());
    if (bounds.length > 2 || bounds.some((piece) => !/^\d+$/u.test(piece))) {
      throw new PageSelectionError('unparsable', `"${part}" is not a page or a range.`);
    }

    const from = Number(bounds[0]);
    const to = bounds.length === 2 ? Number(bounds[1]) : from;
    // "7-3" is a range someone typed backwards, not an error worth stopping for.
    const low = Math.min(from, to);
    const high = Math.max(from, to);
    if (low < 1 || high > pageCount) {
      throw new PageSelectionError(
        'out-of-range',
        `"${part}" is outside this document, which has ${pageCount} pages.`,
      );
    }
    for (let page = low; page <= high; page += 1) chosen.add(page);
  }

  if (!chosen.size) throw new PageSelectionError('empty', 'No pages were given.');
  return [...chosen].sort((a, b) => a - b);
}

/** The inverse, so a selection made by clicking reads back as text. */
export function formatPages(pages: number[]): string {
  const sorted = [...new Set(pages)].sort((a, b) => a - b);
  if (!sorted.length) return '';

  const parts: string[] = [];
  let start = sorted[0];
  let previous = sorted[0];
  const flush = () => {
    // Two consecutive pages read better as "4, 5" than as "4-5".
    if (previous - start >= 2) parts.push(`${start}-${previous}`);
    else for (let page = start; page <= previous; page += 1) parts.push(String(page));
  };

  for (const page of sorted.slice(1)) {
    if (page === previous + 1) { previous = page; continue; }
    flush();
    start = page;
    previous = page;
  }
  flush();
  return parts.join(', ');
}

/** Everything except the selection, which is what "delete these pages" means. */
export function invertPages(pages: number[], pageCount: number): number[] {
  const drop = new Set(pages);
  const kept: number[] = [];
  for (let page = 1; page <= pageCount; page += 1) if (!drop.has(page)) kept.push(page);
  return kept;
}

/**
 * PDF stores rotation as a multiple of 90 between 0 and 270, and a page may
 * already carry one. Turning a page that is already at 270 by another 90 has to
 * land on 0 rather than 360, which some readers ignore.
 */
export const normalizeRotation = (degrees: number): number => ((Math.round(degrees / 90) * 90) % 360 + 360) % 360;

/**
 * Names the output after the input, so a folder of exports stays sorted next to
 * the file they came from. The page number is padded to the width of the largest
 * one, or "page 10" sorts before "page 2" in every file browser there is.
 */
export function pageFileName(base: string, page: number, pageCount: number, extension: string): string {
  const stem = base.replace(/\.[^.]+$/u, '') || 'utilark';
  const width = String(pageCount).length;
  return `${stem}-${String(page).padStart(width, '0')}.${extension}`;
}
