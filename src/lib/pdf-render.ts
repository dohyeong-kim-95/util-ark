import { PdfError } from './pdf-text';
import { CMAP_OPTIONS, loadPdfjs } from './pdfjs';

/**
 * Draws PDF pages as pictures, for the page picker and for the PDF-to-image
 * tool.
 *
 * Shares the loader (`pdfjs.ts`) with `pdf-text.ts` — same CMap directory — but
 * lives apart because reading a page and drawing one need different things, and
 * the read-aloud tool has no use for a canvas.
 */

export type RenderedPage = { page: number; blob: Blob; width: number; height: number };

export type PdfDocument = {
  pageCount: number;
  /** Renders one page at `scale` and returns it as an image blob. */
  render(page: number, scale: number, type: string, quality: number): Promise<RenderedPage>;
  close(): Promise<void>;
};

/** 72 is a PDF point per inch, so this turns a chosen DPI into a render scale. */
export const scaleForDpi = (dpi: number): number => dpi / 72;

/**
 * Guards against a page that would allocate more than the tab can hold. Asking
 * a canvas for too much fails in a way browsers report as a blank image rather
 * than as an error. The ceiling is iOS Safari's canvas area limit (4096 x 4096),
 * the lowest of the major browsers: A3 at 300dpi is about 17.4 megapixels and
 * would already draw blank there, so a larger page is scaled down to fit.
 */
export const MAX_PIXELS = 16_777_216;

export async function openPdf(data: ArrayBuffer): Promise<PdfDocument> {
  const pdfjs = await loadPdfjs();

  const loading = pdfjs.getDocument({
    data,
    ...CMAP_OPTIONS,
    // JBIG2, CCITT fax and JPEG 2000 images — what scanners write — decode only
    // through these files. Without them a scanned page draws as blank white.
    wasmUrl: '/pdfjs/wasm/',
  });

  let pdf;
  try {
    pdf = await loading.promise;
  } catch (error) {
    const name = (error as { name?: string })?.name;
    if (name === 'PasswordException') throw new PdfError('encrypted', 'The PDF is password protected.');
    if (name === 'InvalidPDFException') throw new PdfError('invalid', 'The file is not a PDF.');
    throw new PdfError('unreadable', 'The PDF could not be opened.');
  }

  return {
    pageCount: pdf.numPages,

    async render(number, scale, type, quality) {
      const page = await pdf.getPage(number);
      try {
        const wanted = page.getViewport({ scale });
        // Scaled back rather than refused: a smaller render of a poster is still
        // useful, and a silently blank page is not.
        const fit = Math.min(1, Math.sqrt(MAX_PIXELS / (wanted.width * wanted.height)));
        const viewport = fit < 1 ? page.getViewport({ scale: scale * fit }) : wanted;

        const width = Math.ceil(viewport.width);
        const height = Math.ceil(viewport.height);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext('2d');
        if (!context) throw new PdfError('unreadable', 'This browser has no 2D canvas.');
        // A PDF page is transparent where nothing is drawn, and a JPEG has no
        // transparency — without this, an exported page comes out black.
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, width, height);

        // Only `canvas`. Passing `canvasContext` alongside it is rejected — that
        // parameter is the backwards-compatible path and requires `canvas` to be
        // null — and the failure surfaces as a blank page rather than a message.
        await page.render({ canvas, viewport }).promise;

        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
        if (!blob) throw new PdfError('unreadable', 'The page could not be encoded.');
        // Releases the backing store now rather than at the next collection,
        // which matters when a hundred pages are exported in a row.
        canvas.width = 0;
        canvas.height = 0;
        return { page: number, blob, width, height };
      } finally {
        page.cleanup();
      }
    },

    async close() {
      await loading.destroy();
    },
  };
}
