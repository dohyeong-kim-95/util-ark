/**
 * Copies pdf.js's CMap tables and image decoders into `public/` so the build
 * serves them.
 *
 * They are needed only for PDFs written against a predefined CJK encoding, which
 * carry no ToUnicode table — without the matching CMap their Korean text comes
 * out as mojibake. pdf.js fetches one file on demand, so the 1.7MB set costs
 * nothing to a visitor whose PDF does not need it.
 *
 * The `wasm/` decoders are needed to draw JBIG2, CCITT fax and JPEG 2000
 * images — what most scanners and fax software write. Without them pdf.js skips
 * those images and a scanned page renders blank. Like the CMaps, they are
 * fetched only when a PDF contains such an image.
 *
 * Copied at build time rather than committed: 169 binary files that belong to a
 * dependency have no business in the history, and this way they cannot drift
 * from the installed pdf.js.
 */
import { cp, mkdir, rm, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const assets = [
  { from: '../node_modules/pdfjs-dist/cmaps/', to: '../public/cmaps/' },
  { from: '../node_modules/pdfjs-dist/wasm/', to: '../public/pdfjs/wasm/' },
];

for (const asset of assets) {
  const from = fileURLToPath(new URL(asset.from, import.meta.url));
  const to = fileURLToPath(new URL(asset.to, import.meta.url));
  try {
    await stat(from);
  } catch {
    console.error(`${asset.from} is missing; run npm install first.`);
    process.exit(1);
  }
  await rm(to, { recursive: true, force: true });
  await mkdir(to, { recursive: true });
  await cp(from, to, { recursive: true });
}
console.log('Copied pdf.js CMaps to public/cmaps/ and decoders to public/pdfjs/wasm/.');
