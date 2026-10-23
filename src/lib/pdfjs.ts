/**
 * Loads pdf.js on first use and points it at its worker. Shared by the text
 * reader (`pdf-text.ts`) and the page renderer (`pdf-render.ts`), so the
 * library and its options are set up the same way in both.
 */

/**
 * Korean PDFs written against a predefined CJK encoding carry no ToUnicode
 * table, and without the matching CMap their text extracts and draws as
 * mojibake. The files are served from this site, not a CDN — the PDF itself
 * still goes nowhere, and pdf.js fetches only the one encoding a file asks for.
 */
export const CMAP_OPTIONS = { cMapUrl: '/cmaps/', cMapPacked: true } as const;

export async function loadPdfjs() {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.min.mjs');
  const workerUrl = (await import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url')).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  return pdfjs;
}
