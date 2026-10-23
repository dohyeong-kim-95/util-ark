/**
 * Encodes a canvas and checks that the browser actually wrote the format asked
 * for.
 *
 * `canvas.toBlob` does not fail on a type it cannot write — the spec says to
 * fall back to PNG. Safari (and so every browser on iOS) cannot write WebP, so
 * without this check a "WebP" download is really a PNG with the wrong name, and
 * a quality setting is silently ignored. When a WebP request comes back as
 * something else, the canvas is encoded again as JPEG, which every browser
 * writes, and `fellBack` tells the caller to say so.
 */

export type EncodedImage = { blob: Blob; type: string; fellBack: boolean };

type EncodableCanvas = Pick<HTMLCanvasElement, 'toBlob' | 'getContext' | 'width' | 'height'>;

const toBlob = (canvas: EncodableCanvas, type: string, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

export async function encodeCanvas(canvas: EncodableCanvas, mime: string, quality: number): Promise<EncodedImage | null> {
  const blob = await toBlob(canvas, mime, quality);
  if (!blob) return null;
  if (blob.type === mime) return { blob, type: mime, fellBack: false };
  // Only a WebP request falls back to JPEG, since only WebP has a "this browser
  // cannot write it" notice. Any other type the browser declined (AVIF, GIF, an
  // empty type) is reported as what was really written, so the caller can name
  // the file after it.
  if (mime !== 'image/webp') return { blob, type: blob.type, fellBack: false };

  // JPEG has no transparency, so transparent pixels would come out black. Paint
  // white behind what is already drawn before encoding again.
  const context = canvas.getContext('2d') as CanvasRenderingContext2D | null;
  if (context) {
    context.save();
    context.globalCompositeOperation = 'destination-over';
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.restore();
  }
  const jpeg = await toBlob(canvas, 'image/jpeg', quality);
  if (!jpeg) return null;
  return { blob: jpeg, type: 'image/jpeg', fellBack: true };
}

/** File extension for an encoded image type. */
export function extensionFor(type: string): string {
  if (type === 'image/jpeg') return 'jpg';
  if (type === 'image/webp') return 'webp';
  return 'png';
}

/** Whether this browser can write WebP, checked once with a 1×1 canvas. */
export function canEncodeWebp(): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').startsWith('data:image/webp');
}
