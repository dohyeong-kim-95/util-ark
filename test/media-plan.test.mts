import assert from 'node:assert/strict';
import test from 'node:test';

import {
  MAX_GIF_FRAMES,
  MediaError,
  decodedBytes,
  formatBytes,
  gifBytes,
  maxAudioSeconds,
  mp3Bytes,
  planFrames,
  toInt16,
} from '../src/lib/media-plan.ts';

/* ---------- audio ---------- */

test('decoded size is measured in memory, not in file size', () => {
  // One minute of CD-quality stereo as 32-bit floats.
  assert.equal(decodedBytes(60, 44100, 2), 60 * 44100 * 2 * 4);
  // Mono halves it; a lower rate scales it down in proportion.
  assert.equal(decodedBytes(60, 44100, 1), decodedBytes(60, 44100, 2) / 2);
  assert.equal(decodedBytes(60, 22050, 2), decodedBytes(60, 44100, 2) / 2);
});

test('the length limit follows the format, rather than being one number', () => {
  const stereo = maxAudioSeconds(44100, 2);
  // Around nineteen minutes of CD-quality stereo. The tool shows the figure it
  // computes for the file at hand rather than quoting a fixed number, because
  // the same limit is nearly forty minutes for mono.
  assert.ok(stereo > 15 * 60, `stereo limit should clear fifteen minutes, got ${stereo}s`);
  // Mono fits twice as long, give or take the second lost to rounding down.
  assert.ok(Math.abs(maxAudioSeconds(44100, 1) - stereo * 2) <= 1);
  assert.ok(maxAudioSeconds(48000, 2) < stereo, 'a higher sample rate must allow less time');
});

test('float samples narrow to 16-bit at full scale', () => {
  const out = toInt16(new Float32Array([0, 1, -1, 0.5, -0.5]));
  assert.equal(out[0], 0);
  assert.equal(out[1], 32767);
  assert.equal(out[2], -32768);
  assert.equal(out[3], Math.round(0.5 * 32767));
  assert.equal(out[4], -16384);
});

test('samples beyond full scale clamp instead of wrapping', () => {
  // Wrapping is the audible failure here: a loud passage would come back as
  // a burst of noise rather than as distortion.
  const out = toInt16(new Float32Array([2, -2, 1.0001, -1.0001]));
  assert.deepEqual(Array.from(out), [32767, -32768, 32767, -32768]);
});

test('the estimated MP3 size follows the bitrate', () => {
  assert.equal(mp3Bytes(60, 128), (60 * 128 * 1000) / 8);
  assert.equal(mp3Bytes(60, 256), mp3Bytes(60, 128) * 2);
});

/* ---------- GIF frame planning ---------- */

const base = { duration: 10, fps: 10, maxWidth: 480, sourceWidth: 1920, sourceHeight: 1080 };

test('a plain clip yields one frame per interval, inside the clip', () => {
  const plan = planFrames(base);
  assert.equal(plan.times.length, 100);
  assert.ok(plan.times[0] > 0 && plan.times[0] < 0.2, `first frame at ${plan.times[0]}`);
  assert.ok(plan.times.at(-1)! < 10, 'the last frame must fall inside the video');
  assert.deepEqual(plan.times, [...plan.times].sort((a, b) => a - b));
});

test('the picture is scaled down but never up, and stays even', () => {
  const plan = planFrames(base);
  assert.equal(plan.width, 480);
  assert.equal(plan.height, 270);
  // An odd source must not produce an odd output.
  const odd = planFrames({ ...base, sourceWidth: 641, sourceHeight: 361, maxWidth: 481 });
  assert.equal(odd.width % 2, 0);
  assert.equal(odd.height % 2, 0);
  // Smaller than the limit is left alone.
  const small = planFrames({ ...base, sourceWidth: 320, sourceHeight: 240 });
  assert.deepEqual([small.width, small.height], [320, 240]);
});

test('only the chosen range is sampled', () => {
  const plan = planFrames({ ...base, start: 4, end: 6 });
  assert.equal(plan.times.length, 20);
  assert.ok(plan.times[0] >= 4, `${plan.times[0]} should be at or after 4`);
  assert.ok(plan.times.at(-1)! <= 6, `${plan.times.at(-1)} should be at or before 6`);
});

test('a range outside the video is pulled back inside it', () => {
  const plan = planFrames({ ...base, start: -5, end: 999 });
  assert.ok(plan.times[0] >= 0);
  assert.ok(plan.times.at(-1)! <= 10);
});

test('an empty range is refused rather than producing an empty GIF', () => {
  assert.throws(() => planFrames({ ...base, start: 5, end: 5 }), (error: MediaError) => {
    assert.equal(error.reason, 'empty');
    return true;
  });
  assert.throws(() => planFrames({ ...base, duration: 0 }), (error: MediaError) => {
    assert.equal(error.reason, 'empty');
    return true;
  });
});

test('a range shorter than one frame still yields a frame', () => {
  const plan = planFrames({ ...base, start: 1, end: 1.02, fps: 10 });
  assert.equal(plan.times.length, 1);
  assert.equal(plan.delays.length, 1);
});

test('the frame count is capped, so a long clip cannot run away', () => {
  const plan = planFrames({ ...base, duration: 3600, end: 3600, fps: 30 });
  assert.equal(plan.times.length, MAX_GIF_FRAMES);
  assert.equal(plan.delays.length, MAX_GIF_FRAMES);
});

/* ---------- GIF timing ---------- */

test('a frame rate that divides evenly gets an exact delay', () => {
  assert.deepEqual(planFrames({ ...base, fps: 10, duration: 0.5, end: 0.5 }).delays, [10, 10, 10, 10, 10]);
  assert.deepEqual(planFrames({ ...base, fps: 20, duration: 0.25, end: 0.25 }).delays, [5, 5, 5, 5, 5]);
});

test('a frame rate that does not divide evenly keeps the clip the right length', () => {
  // 15fps is 6.67 hundredths per frame. Rounding each frame to 7 would run the
  // GIF 5% slow, which is three seconds adrift over a minute.
  const plan = planFrames({ ...base, fps: 15, duration: 4, end: 4 });
  assert.equal(plan.delays.length, 60);
  const total = plan.delays.reduce((sum, delay) => sum + delay, 0);
  assert.equal(total, 400, 'sixty frames at 15fps must still add up to four seconds');
  assert.ok(new Set(plan.delays).size > 1, 'the rounding has to alternate to stay on time');
});

test('no frame is given a zero delay', () => {
  // A zero delay hands the pace to the viewer, and GIFs then play at whatever
  // speed the program feels like.
  for (const fps of [10, 15, 24, 30, 50, 100, 120]) {
    const plan = planFrames({ ...base, fps, duration: 2, end: 2 });
    assert.ok(plan.delays.every((delay) => delay >= 1), `fps ${fps} produced a zero delay`);
  }
});

/* ---------- estimates ---------- */

test('the GIF estimate grows with frames and with area', () => {
  const small = gifBytes(planFrames({ ...base, maxWidth: 240 }));
  const large = gifBytes(planFrames({ ...base, maxWidth: 480 }));
  assert.ok(large > small * 3, 'doubling the width roughly quadruples the area');
  const longer = gifBytes(planFrames({ ...base, fps: 20 }));
  assert.ok(longer > large, 'more frames must estimate larger');
});

test('sizes read the way people write them', () => {
  assert.equal(formatBytes(0, 'en'), '0 B');
  assert.equal(formatBytes(999, 'en'), '999 B');
  assert.equal(formatBytes(1024, 'en'), '1 KB');
  assert.equal(formatBytes(1536, 'en'), '1.5 KB');
  assert.equal(formatBytes(5 * 1024 * 1024, 'en'), '5 MB');
  assert.equal(formatBytes(1024 ** 3, 'en'), '1 GB');
});
