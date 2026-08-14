/**
 * The arithmetic behind the two video tools, kept away from the browser APIs
 * that surround it.
 *
 * Everything here decides *what* to produce — how many frames, at which
 * timestamps, at what size, and whether the job will fit in memory at all —
 * before a single frame is decoded. That ordering matters: a video tool that
 * discovers it has run out of memory halfway through has already made the tab
 * unresponsive, and the visitor has no idea why.
 */

/* ---------- shared ---------- */

export class MediaError extends Error {
  readonly reason:
    | 'unreadable'
    | 'no-audio'
    | 'too-long'
    | 'too-large'
    | 'empty'
    | 'unsupported-codec';

  constructor(reason: MediaError['reason'], message: string) {
    super(message);
    this.name = 'MediaError';
    this.reason = reason;
  }
}

/* ---------- extracting audio ---------- */

/**
 * `decodeAudioData` hands back the whole track as 32-bit floats, so a decoded
 * hour of CD-quality stereo is about 1.3GB and the tab dies. The limit is set on
 * that decoded size rather than on the file size, because an hour of speech in a
 * small file decodes to exactly as much memory as an hour of music in a large
 * one.
 */
export const MAX_DECODED_BYTES = 400 * 1024 * 1024;

export const decodedBytes = (seconds: number, sampleRate: number, channels: number): number =>
  Math.ceil(seconds * sampleRate * channels * 4);

/** How long a file may be before it cannot be decoded in one piece. */
export const maxAudioSeconds = (sampleRate: number, channels: number): number =>
  Math.floor(MAX_DECODED_BYTES / (sampleRate * channels * 4));

/**
 * MP3 carries 16-bit samples, so the floats have to be narrowed. Values outside
 * ±1 are not an error — mixing routinely overshoots — and clamping them is what
 * keeps a loud passage from wrapping around into noise.
 */
export function toInt16(samples: Float32Array): Int16Array {
  const out = new Int16Array(samples.length);
  for (let at = 0; at < samples.length; at += 1) {
    const value = samples[at];
    // The asymmetry is real: a signed 16-bit sample runs -32768..32767. Rounded
    // rather than truncated, because Int16Array truncates toward zero and that
    // pulls every sample a fraction closer to silence.
    out[at] = Math.round(value < 0 ? Math.max(-1, value) * 0x8000 : Math.min(1, value) * 0x7fff);
  }
  return out;
}

/** Bitrates LAME accepts, so an unsupported number cannot reach the encoder. */
export const MP3_BITRATES = [96, 128, 192, 256, 320] as const;
export type Mp3Bitrate = (typeof MP3_BITRATES)[number];

/** Roughly what the result will weigh, which is the question people actually ask. */
export const mp3Bytes = (seconds: number, bitrate: Mp3Bitrate): number =>
  Math.round((seconds * bitrate * 1000) / 8);

/* ---------- turning video into a GIF ---------- */

/**
 * A GIF holds a whole palette-mapped bitmap per frame with no motion
 * compensation, so its size is close to frames x pixels. Ten seconds of 720p at
 * 30fps is hundreds of megabytes, which is why the defaults are modest and why
 * the estimate is shown before the work starts rather than after.
 */
export const MAX_GIF_FRAMES = 600;

export type FramePlan = {
  /** Seconds into the video, in order. */
  times: number[];
  /** GIF stores delay in hundredths of a second, per frame. */
  delays: number[];
  width: number;
  height: number;
};

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));

/**
 * GIF timing is in hundredths of a second, so most frame rates are not
 * representable: 15fps is 6.67 hundredths. Rounding every frame the same way
 * drifts — 15fps rounded to 7 runs 5% slow, and over a minute that is three
 * seconds. Rounding the running total instead keeps the clip the length it
 * actually was.
 */
function delaysFor(count: number, fps: number): number[] {
  const delays: number[] = [];
  let emitted = 0;
  for (let frame = 1; frame <= count; frame += 1) {
    const target = Math.round((frame * 100) / fps);
    // Every frame needs a delay of at least one; a zero tells viewers to pick
    // their own rate, which is how a GIF ends up playing at a random speed.
    delays.push(Math.max(1, target - emitted));
    emitted += delays[delays.length - 1];
  }
  return delays;
}

/**
 * Sizes the output and lists the timestamps to grab. `end` is exclusive of the
 * final frame only in the sense that sampling stops once the range is covered.
 */
export function planFrames(options: {
  duration: number;
  start?: number;
  end?: number;
  fps: number;
  maxWidth: number;
  sourceWidth: number;
  sourceHeight: number;
  maxFrames?: number;
}): FramePlan {
  const {
    duration, fps, maxWidth, sourceWidth, sourceHeight, maxFrames = MAX_GIF_FRAMES,
  } = options;
  if (!(duration > 0)) throw new MediaError('empty', 'The video has no duration.');
  if (!(sourceWidth > 0) || !(sourceHeight > 0)) {
    throw new MediaError('unreadable', 'The video has no picture size.');
  }

  const start = clamp(options.start ?? 0, 0, duration);
  const end = clamp(options.end ?? duration, start, duration);
  const span = end - start;
  if (!(span > 0)) throw new MediaError('empty', 'The selected range is empty.');

  const wanted = Math.floor(span * fps);
  // A range shorter than one frame interval still deserves its one frame.
  const count = clamp(wanted || 1, 1, maxFrames);

  const times: number[] = [];
  for (let frame = 0; frame < count; frame += 1) {
    // Sampled at the middle of each interval rather than the edge: a frame taken
    // exactly at a cut lands on whichever side the decoder rounds to.
    times.push(Math.min(end - 1e-3, start + ((frame + 0.5) * span) / count));
  }

  const scale = Math.min(1, maxWidth / sourceWidth);
  // Even numbers, because odd-width scaling leaves a half-pixel column that
  // quantises to a bright fringe down one edge.
  const width = Math.max(2, Math.round((sourceWidth * scale) / 2) * 2);
  const height = Math.max(2, Math.round((sourceHeight * scale) / 2) * 2);

  return { times, delays: delaysFor(count, fps), width, height };
}

/**
 * A rough weight for the finished GIF. Palette images compress by roughly four
 * to one on typical footage, which is close enough to warn someone off a
 * hundred-megabyte export and not close enough to print as a fact.
 */
export const gifBytes = (plan: FramePlan): number =>
  Math.round((plan.width * plan.height * plan.times.length) / 4);

/** Human-readable size, used in both tools and in their warnings. */
export function formatBytes(bytes: number, locale: string): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) { value /= 1024; unit += 1; }
  const rounded = value >= 100 || unit === 0 ? Math.round(value) : Number(value.toFixed(1));
  return `${rounded.toLocaleString(locale)} ${units[unit]}`;
}
