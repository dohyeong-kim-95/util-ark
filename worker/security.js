const encoder = new TextEncoder();

export const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

const bytesToBase64Url = (bytes) => {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/u, '');
};

const textToBase64Url = (text) => bytesToBase64Url(encoder.encode(text));

const base64UrlToText = (value) => {
  const padded = value.replaceAll('-', '+').replaceAll('_', '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  const binary = atob(padded);
  return new TextDecoder().decode(Uint8Array.from(binary, (character) => character.charCodeAt(0)));
};

export async function sign(secret, value) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return bytesToBase64Url(new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(value))));
}

export async function safeCredentialMatch(secret, submitted, expected) {
  const [left, right] = await Promise.all([
    sign(secret, String(submitted ?? '')),
    sign(secret, String(expected ?? '')),
  ]);
  return left === right;
}

export async function issueSession(secret, now = Date.now()) {
  const payload = textToBase64Url(JSON.stringify({ exp: now + SESSION_TTL_MS }));
  return `${payload}.${await sign(secret, payload)}`;
}

export async function validSession(secret, token, now = Date.now()) {
  if (!secret || !token) return false;
  const [payload, signature, ...extra] = token.split('.');
  if (!payload || !signature || extra.length) return false;
  if ((await sign(secret, payload)) !== signature) return false;

  try {
    const session = JSON.parse(base64UrlToText(payload));
    return Number.isFinite(session.exp) && session.exp > now;
  } catch {
    return false;
  }
}

export function parseCookies(request) {
  const result = {};
  for (const part of (request.headers.get('Cookie') ?? '').split(';')) {
    const separator = part.indexOf('=');
    if (separator < 1) continue;
    const name = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    if (name) result[name] = value;
  }
  return result;
}

export function sameOriginMutation(request) {
  const origin = request.headers.get('Origin');
  if (!origin || origin !== new URL(request.url).origin) return false;
  const fetchSite = request.headers.get('Sec-Fetch-Site');
  return !fetchSite || fetchSite === 'same-origin';
}

/**
 * A same-origin check loose enough for a fire-and-forget analytics beacon
 * (sendBeacon, or its keepalive-fetch fallback), where rejecting a real
 * visitor silently loses a metric and accepting a forged one only lets an
 * attacker inflate a count they could already inflate by visiting for real.
 * `sameOriginMutation` fails closed when `Origin` is missing, which state
 * -changing endpoints want — but Chromium is the only engine that reliably
 * sends `Sec-Fetch-Site`, and WebKit (Safari) has never shipped Fetch
 * Metadata headers at all, so a same-origin beacon from Safari or an older
 * Firefox can legitimately arrive with neither header set. Only an
 * explicit cross-origin signal disqualifies a request here; the absence of
 * any signal is treated as same-origin.
 */
export function likelySameOriginBeacon(request) {
  const fetchSite = request.headers.get('Sec-Fetch-Site');
  if (fetchSite) return fetchSite === 'same-origin';
  const origin = request.headers.get('Origin');
  if (origin) return origin === new URL(request.url).origin;
  return true;
}

export function declaredBodyFits(request, maximumBytes) {
  const declared = request.headers.get('Content-Length');
  return !declared || (Number.isFinite(Number(declared)) && Number(declared) <= maximumBytes);
}

/**
 * Reads a request body as text, giving up as soon as it passes the limit.
 * `Content-Length` alone is not enough: a chunked request carries no length, so
 * the bytes have to be counted as they arrive. Returns null when the body is
 * too large.
 */
export async function readBodyWithin(request, maximumBytes) {
  if (!declaredBodyFits(request, maximumBytes)) return null;
  if (!request.body) return '';
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let total = 0;
  let text = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maximumBytes) {
      await reader.cancel();
      return null;
    }
    text += decoder.decode(value, { stream: true });
  }
  return text + decoder.decode();
}

export async function anonymousVisitorKey(request, secret) {
  const address = request.headers.get('CF-Connecting-IP') ?? 'local-development';
  return sign(secret, `visitor:${address}`);
}

/**
 * The eight 16-bit groups of an IPv6 address, or null when it is not one.
 * Handles `::` and a trailing dotted IPv4 part (`::ffff:192.0.2.1`).
 */
export function ipv6Groups(address) {
  const text = String(address).split('%')[0].toLowerCase();
  if (!text.includes(':')) return null;
  const halves = text.split('::');
  if (halves.length > 2) return null;

  const toGroups = (part) => {
    if (!part) return [];
    const groups = [];
    for (const piece of part.split(':')) {
      if (piece.includes('.')) {
        const v4 = ipv4Number(piece);
        if (v4 === null) return null;
        groups.push(Math.floor(v4 / 0x10000), v4 % 0x10000);
        continue;
      }
      if (!/^[0-9a-f]{1,4}$/u.test(piece)) return null;
      groups.push(parseInt(piece, 16));
    }
    return groups;
  };

  const head = toGroups(halves[0]);
  const tail = halves.length === 2 ? toGroups(halves[1]) : [];
  if (head === null || tail === null) return null;
  if (halves.length === 1) return head.length === 8 ? head : null;
  const missing = 8 - head.length - tail.length;
  if (missing < 1) return null;
  return [...head, ...new Array(missing).fill(0), ...tail];
}

/** An IPv4 address as an unsigned 32-bit number, or null when it is not one. */
export function ipv4Number(address) {
  const parts = String(address).split('.');
  if (parts.length !== 4) return null;
  let value = 0;
  for (const part of parts) {
    if (!/^\d{1,3}$/u.test(part) || Number(part) > 255) return null;
    value = value * 256 + Number(part);
  }
  return value;
}

/**
 * What one sender controls. An IPv4 address is one sender; an IPv6 host
 * usually gets a whole /64 and can pick any address in it, so counting per
 * address there would let one machine multiply its attempts at will.
 */
export function rateLimitAddress(address) {
  const groups = ipv6Groups(address);
  if (!groups) return String(address);
  const prefix = [];
  for (const group of groups.slice(0, 4)) prefix.push(group.toString(16));
  return `${prefix.join(':')}::/64`;
}

/** Like anonymousVisitorKey, but one key per IPv6 /64 (IPv4 unchanged). */
export async function anonymousAddressBlockKey(request, secret) {
  const address = request.headers.get('CF-Connecting-IP') ?? 'local-development';
  return sign(secret, `visitor:${rateLimitAddress(address)}`);
}

/** An address as a bit length and a BigInt, so IPv4 and IPv6 share one CIDR check. */
function addressBits(address) {
  const v4 = ipv4Number(address);
  if (v4 !== null) return { bits: 32, value: BigInt(v4) };
  const groups = ipv6Groups(address);
  if (!groups) return null;
  let value = 0n;
  for (const group of groups) value = (value << 16n) | BigInt(group);
  return { bits: 128, value };
}

/**
 * Whether an address is in a comma-separated list of addresses and CIDR
 * ranges, such as `203.0.113.7, 2001:db8:1234::/48`. Entries that do not
 * parse are skipped rather than matching everything.
 */
export function addressInList(address, list) {
  if (!address || !list) return false;
  const target = addressBits(address);
  if (!target) return false;

  for (const rawEntry of String(list).split(',')) {
    const entry = rawEntry.trim();
    if (!entry) continue;
    const [base, prefixText] = entry.split('/');
    const range = addressBits(base);
    if (!range || range.bits !== target.bits) continue;
    const prefix = prefixText === undefined ? range.bits : Number(prefixText);
    if (!Number.isInteger(prefix) || prefix < 0 || prefix > range.bits) continue;
    const shift = BigInt(range.bits - prefix);
    if ((range.value >> shift) === (target.value >> shift)) return true;
  }
  return false;
}

export function jsonResponse(data, init = {}) {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  headers.set('Cache-Control', 'no-store');
  return new Response(JSON.stringify(data), { ...init, headers });
}

export function withSecurityHeaders(response, { admin = false } = {}) {
  const headers = new Headers(response.headers);
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  if (admin) {
    headers.set('Cache-Control', 'no-store');
    headers.set('X-Robots-Tag', 'noindex, nofollow');
    headers.set(
      'Content-Security-Policy',
      "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",
    );
  }
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
