import { MediaError, type FramePlan } from './media-plan';

/**
 * Turns part of a video into an animated GIF, in the browser.
 *
 * Frames come from a `<video>` element seeked to each timestamp and drawn onto a
 * canvas, rather than from WebCodecs and a demuxer. That trades some speed for
 * working with whatever the browser can already play, and for not shipping a
 * container parser to do it.
 */

export type GifProgress = (done: number, total: number) => void;

export type VideoFacts = { duration: number; width: number; height: number };

/** Reads the dimensions and length without decoding any pictures. */
export function inspectVideo(file: File): Promise<{ facts: VideoFacts; video: HTMLVideoElement; url: string }> {
  const url = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.preload = 'auto';
  video.muted = true;
  // Needed on iOS, where an un-inlined video takes over the screen the moment
  // it is asked to show a frame.
  video.playsInline = true;
  video.src = url;

  return new Promise((resolve, reject) => {
    const fail = () => {
      URL.revokeObjectURL(url);
      // The browser reports a missing codec and a corrupt file identically, and
      // for the visitor the answer is the same either way.
      reject(new MediaError('unsupported-codec', 'The video could not be opened.'));
    };
    video.addEventListener('error', fail, { once: true });
    video.addEventListener('loadedmetadata', () => {
      const { duration, videoWidth: width, videoHeight: height } = video;
      if (!width || !height) { fail(); return; }
      if (!Number.isFinite(duration) || duration <= 0) {
        URL.revokeObjectURL(url);
        reject(new MediaError('empty', 'The video has no duration.'));
        return;
      }
      resolve({ facts: { duration, width, height }, video, url });
    }, { once: true });
  });
}

/**
 * Seeking is asynchronous and, on some browsers, approximate: asking for 1.234s
 * lands on the nearest frame the decoder can start from. That is fine for a GIF,
 * but the wait has to be for `seeked` rather than for a timeout, or frames come
 * back duplicated.
 */
function seek(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const done = () => { cleanup(); resolve(); };
    const failed = () => { cleanup(); reject(new MediaError('unreadable', 'Seeking failed.')); };
    const cleanup = () => {
      video.removeEventListener('seeked', done);
      video.removeEventListener('error', failed);
    };
    video.addEventListener('seeked', done, { once: true });
    video.addEventListener('error', failed, { once: true });
    video.currentTime = time;
  });
}

/**
 * Draws every planned frame and writes the GIF.
 *
 * The palette is built once, from a frame in the middle of the clip, and reused
 * for the rest. Quantising each frame separately gives every frame a slightly
 * different palette, and the whole animation then shimmers — the colours shift
 * under an unchanging background. One palette is both steadier and smaller.
 */
export async function videoToGif(
  video: HTMLVideoElement,
  plan: FramePlan,
  onProgress?: GifProgress,
): Promise<Blob> {
  const { GIFEncoder, quantize, applyPalette } = await import('gifenc');

  const canvas = document.createElement('canvas');
  canvas.width = plan.width;
  canvas.height = plan.height;
  // Reading pixels back every frame is the whole job, so tell the browser that
  // up front rather than letting it optimise for display.
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new MediaError('unreadable', 'This browser has no 2D canvas.');

  const grab = async (time: number): Promise<Uint8ClampedArray> => {
    await seek(video, time);
    context.drawImage(video, 0, 0, plan.width, plan.height);
    return context.getImageData(0, 0, plan.width, plan.height).data;
  };

  const middle = plan.times[Math.floor(plan.times.length / 2)];
  const palette = quantize(await grab(middle), 256, { format: 'rgb565' });

  const encoder = GIFEncoder();
  for (let frame = 0; frame < plan.times.length; frame += 1) {
    const pixels = await grab(plan.times[frame]);
    encoder.writeFrame(applyPalette(pixels, palette, 'rgb565'), plan.width, plan.height, {
      palette: frame === 0 ? palette : undefined,
      delay: plan.delays[frame] * 10,
      transparent: false,
    });
    onProgress?.(frame + 1, plan.times.length);
  }
  encoder.finish();

  return new Blob([encoder.bytes() as BlobPart], { type: 'image/gif' });
}
