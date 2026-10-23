/**
 * Small browser helpers the tools all need: turning a picked image into
 * something a canvas can draw, and handing a finished file to the visitor.
 * Kept in one place so a fix to either (an EXIF quirk, a download quirk) is
 * made once rather than in every tool.
 */

export type DecodedImage = ImageBitmap | HTMLImageElement;

/**
 * A phone photo stores landscape pixels plus an EXIF rotation tag. Whether
 * `createImageBitmap` applies that tag depends on the browser's default, so it
 * is asked for explicitly — otherwise a portrait photo is drawn on its side.
 */
export async function decodeImage(file: File): Promise<DecodedImage> {
  if ('createImageBitmap' in window) {
    return createImageBitmap(file, { imageOrientation: 'from-image' })
      .catch(() => createImageBitmap(file));
  }
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('decode')); };
    image.src = url;
  });
}

/** Frees an ImageBitmap's pixels; an HTMLImageElement has nothing to close. */
export function closeImage(image: DecodedImage): void {
  if ('close' in image && typeof image.close === 'function') image.close();
}

/**
 * Starts a download. The object URL is revoked a second later rather than
 * straight away: some browsers start reading the blob only after `click()`
 * returns, and a URL revoked at once makes that download fail.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Makes every `.drop-zone` accept dropped files. The dashed box invites a
 * drop, and without a handler the browser opens the dropped file itself and
 * the page is gone. A drop is passed to the zone's own file input and
 * announced with a `change` event, so each tool handles it exactly as if the
 * file had been picked. A zone whose input takes one file gets the first.
 */
export function wireDropZones(): void {
  document.querySelectorAll<HTMLElement>('.drop-zone').forEach((zone) => {
    const input = zone.querySelector<HTMLInputElement>('input[type="file"]');
    if (!input) return;

    zone.addEventListener('dragover', (event) => {
      if (!event.dataTransfer?.types.includes('Files')) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
      zone.classList.add('is-dropping');
    });
    zone.addEventListener('dragleave', (event) => {
      if (event.relatedTarget && zone.contains(event.relatedTarget as Node)) return;
      zone.classList.remove('is-dropping');
    });
    zone.addEventListener('drop', (event) => {
      const dropped = event.dataTransfer?.files;
      if (!dropped || dropped.length === 0) return;
      event.preventDefault();
      zone.classList.remove('is-dropping');

      const transfer = new DataTransfer();
      const count = input.multiple ? dropped.length : 1;
      for (let index = 0; index < count; index += 1) transfer.items.add(dropped[index]);
      input.files = transfer.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  });
}
