import assert from 'node:assert/strict';
import test from 'node:test';

import { encodeCanvas, extensionFor } from '../src/lib/canvas-encode.ts';

/**
 * A stand-in canvas that writes only the types it is given, falling back to
 * PNG for anything else — what the spec requires and what Safari does for WebP.
 */
const fakeCanvas = (writable: string[]) => {
  const requested: string[] = [];
  const canvas = {
    width: 2,
    height: 2,
    getContext: () => ({ save() {}, restore() {}, fillRect() {}, globalCompositeOperation: '', fillStyle: '' }),
    toBlob(callback: (blob: Blob | null) => void, type: string) {
      requested.push(type);
      const written = writable.includes(type) ? type : 'image/png';
      callback(new Blob(['x'], { type: written }));
    },
  };
  return { canvas: canvas as never, requested };
};

test('a browser that writes WebP gets WebP', async () => {
  const { canvas } = fakeCanvas(['image/png', 'image/jpeg', 'image/webp']);
  const result = await encodeCanvas(canvas, 'image/webp', 0.8);
  assert.equal(result?.type, 'image/webp');
  assert.equal(result?.fellBack, false);
});

test('a browser that silently writes PNG for WebP is re-encoded as JPEG', async () => {
  const { canvas, requested } = fakeCanvas(['image/png', 'image/jpeg']);
  const result = await encodeCanvas(canvas, 'image/webp', 0.8);
  assert.deepEqual(requested, ['image/webp', 'image/jpeg']);
  assert.equal(result?.type, 'image/jpeg');
  assert.equal(result?.blob.type, 'image/jpeg');
  assert.equal(result?.fellBack, true);
  assert.equal(extensionFor(result!.type), 'jpg');
});

test('PNG and JPEG requests are encoded once', async () => {
  const { canvas, requested } = fakeCanvas(['image/png', 'image/jpeg']);
  assert.equal((await encodeCanvas(canvas, 'image/png', 1))?.type, 'image/png');
  assert.equal((await encodeCanvas(canvas, 'image/jpeg', 0.9))?.type, 'image/jpeg');
  assert.deepEqual(requested, ['image/png', 'image/jpeg']);
});
