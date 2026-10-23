import {
  MAX_DECODED_BYTES,
  MediaError,
  type Mp3Bitrate,
  decodedBytes,
  toInt16,
  tooLongToDecode,
  withTimeout,
} from './media-plan';

/**
 * Pulls the sound out of a video file and writes it as an MP3, in the browser.
 *
 * The decode is the browser's own: `decodeAudioData` hands the file to the same
 * codecs that play it, so whatever a browser can play, it can extract. That is
 * also the catch — a browser built without the AAC licence plays no MP4 audio,
 * and this reports that rather than producing a silent file.
 */

export type Mp3Progress = (fraction: number) => void;

/** Reported so the tool can say what it is about to make before making it. */
export type AudioFacts = { seconds: number; sampleRate: number; channels: number };

/**
 * Reads the length from the container's header through a media element, which
 * costs a few kilobytes instead of the whole file. Resolves NaN when the
 * browser cannot tell or takes too long; the decode then goes ahead and the
 * exact check after it still applies.
 */
function readDuration(file: File): Promise<number> {
  const url = URL.createObjectURL(file);
  const media = document.createElement('video');
  media.preload = 'metadata';
  media.muted = true;
  media.src = url;

  const loaded = new Promise<number>((resolve) => {
    media.addEventListener('loadedmetadata', () => resolve(media.duration), { once: true });
    media.addEventListener('error', () => resolve(Number.NaN), { once: true });
  });
  // Short, because this only guards a check the decode repeats exactly: iOS
  // may never fire loadedmetadata for an element off the page, and waiting
  // there just delays every file.
  return withTimeout(loaded, 2000, () => new Error('metadata timeout'))
    .catch(() => Number.NaN)
    .finally(() => {
      media.removeAttribute('src');
      media.load();
      URL.revokeObjectURL(url);
    });
}

/**
 * A 5.1 film track keeps its dialogue in the centre channel. Taking only the
 * first two channels (front left and right) would drop most of the speech, so
 * wider tracks are rendered once through a two-channel offline context, which
 * applies the standard Web Audio speaker downmix.
 */
async function downmixToStereo(buffer: AudioBuffer): Promise<AudioBuffer> {
  if (buffer.numberOfChannels <= 2) return buffer;
  const Offline = window.OfflineAudioContext
    ?? (window as { webkitOfflineAudioContext?: typeof OfflineAudioContext }).webkitOfflineAudioContext;
  if (!Offline) return buffer;

  const offline = new Offline(2, buffer.length, buffer.sampleRate);
  const source = offline.createBufferSource();
  source.buffer = buffer;
  source.connect(offline.destination);
  source.start();
  return offline.startRendering();
}

/**
 * Decodes the whole track. Held in one piece because `decodeAudioData` takes a
 * complete file and returns a complete buffer. The length is checked from the
 * file's header first, so a file that is far too long is refused before the
 * tab is asked for more memory than it has; the exact check after decoding
 * catches what the header check could not.
 */
export async function decodeAudio(file: File): Promise<AudioBuffer> {
  const Context = window.AudioContext ?? (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Context) throw new MediaError('unreadable', 'This browser has no Web Audio support.');

  const context = new Context();
  try {
    // decodeAudioData resamples to the context's rate, so that is the rate the
    // decoded size depends on.
    const headerSeconds = await readDuration(file);
    if (Number.isFinite(headerSeconds) && tooLongToDecode(headerSeconds, context.sampleRate)) {
      throw new MediaError('too-long', 'The audio is too long to decode in one piece.');
    }
    // Read here and handed straight to the decoder, which detaches it, so the
    // file is held once rather than copied.
    const buffer = await context.decodeAudioData(await file.arrayBuffer());
    if (!buffer.length) throw new MediaError('no-audio', 'The file has no audio track.');
    if (decodedBytes(buffer.duration, buffer.sampleRate, buffer.numberOfChannels) > MAX_DECODED_BYTES) {
      throw new MediaError('too-long', 'The audio is too long to decode in one piece.');
    }
    return await downmixToStereo(buffer);
  } catch (error) {
    if (error instanceof MediaError) throw error;
    // Every browser words this differently, and none of them distinguish "no
    // audio track" from "a codec I do not have" in a way worth parsing.
    throw new MediaError('unsupported-codec', 'The audio could not be decoded.');
  } finally {
    void context.close();
  }
}

/**
 * Encodes an AudioBuffer to MP3.
 *
 * LAME wants each channel separately as 16-bit samples, and wants them in
 * blocks — feeding it the whole track at once allocates a second copy of
 * everything. 1152 samples is one MP3 frame, and blocks of a hundred of those
 * keep the loop cheap without letting the interim buffers grow.
 */
export async function encodeMp3(
  buffer: AudioBuffer,
  bitrate: Mp3Bitrate,
  onProgress?: Mp3Progress,
): Promise<Blob> {
  const { Mp3Encoder } = await import('@breezystack/lamejs');

  // LAME handles mono and stereo. `decodeAudio` has already folded wider
  // tracks down to stereo; the cap here only guards a buffer from elsewhere.
  const channels = Math.min(2, buffer.numberOfChannels);
  const encoder = new Mp3Encoder(channels, buffer.sampleRate, bitrate);

  const left = toInt16(buffer.getChannelData(0));
  const right = channels > 1 ? toInt16(buffer.getChannelData(1)) : null;

  const BLOCK = 1152 * 100;
  const parts: Uint8Array[] = [];
  for (let at = 0; at < left.length; at += BLOCK) {
    const chunk = right
      ? encoder.encodeBuffer(left.subarray(at, at + BLOCK), right.subarray(at, at + BLOCK))
      : encoder.encodeBuffer(left.subarray(at, at + BLOCK));
    if (chunk.length) parts.push(chunk);
    onProgress?.(Math.min(1, (at + BLOCK) / left.length));
    // Encoding a long track blocks the main thread for seconds at a time. This
    // yields between blocks so the progress text can actually paint.
    if (at % (BLOCK * 4) === 0) await new Promise((resolve) => setTimeout(resolve, 0));
  }

  // The final call drains the encoder's own buffer; skipping it truncates the
  // last fraction of a second.
  const tail = encoder.flush();
  if (tail.length) parts.push(tail);
  onProgress?.(1);

  return new Blob(parts as BlobPart[], { type: 'audio/mpeg' });
}
