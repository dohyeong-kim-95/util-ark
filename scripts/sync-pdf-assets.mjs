/**
 * Copies pdf.js's CMap tables into `public/` so the build serves them.
 *
 * They are needed only for PDFs written against a predefined CJK encoding, which
 * carry no ToUnicode table — without the matching CMap their Korean text comes
 * out as mojibake. pdf.js fetches one file on demand, so the 1.7MB set costs
 * nothing to a visitor whose PDF does not need it.
 *
 * Copied at build time rather than committed: 169 binary files that belong to a
 * dependency have no business in the history, and this way they cannot drift
 * from the installed pdf.js.
 */
import { cp, mkdir, rm, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const from = fileURLToPath(new URL('../node_modules/pdfjs-dist/cmaps/', import.meta.url));
const to = fileURLToPath(new URL('../public/cmaps/', import.meta.url));

try {
  await stat(from);
} catch {
  console.error('pdfjs-dist is not installed; run npm install first.');
  process.exit(1);
}

await rm(to, { recursive: true, force: true });
await mkdir(to, { recursive: true });
await cp(from, to, { recursive: true });
console.log(`Copied pdf.js CMaps to public/cmaps/.`);
