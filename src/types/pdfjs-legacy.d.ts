/**
 * pdf.js is imported from its `legacy` build, which ships transpiled and
 * polyfilled. The modern build calls `Map.prototype.getOrInsertComputed`, a
 * method only the newest browsers have, and a browser without it fails inside
 * `page.render()` with a TypeError rather than anything a visitor could act on.
 *
 * The legacy entry point has no types of its own under this specifier, so they
 * are borrowed from the build beside it rather than letting the whole module
 * fall back to `any` — which is what silently turned every pdf.js call in this
 * project unchecked the first time this import was switched.
 */
declare module 'pdfjs-dist/legacy/build/pdf.min.mjs' {
  export * from 'pdfjs-dist/legacy/build/pdf.mjs';
}
