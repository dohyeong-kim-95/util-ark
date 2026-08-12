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

export function declaredBodyFits(request, maximumBytes) {
  const declared = request.headers.get('Content-Length');
  return !declared || (Number.isFinite(Number(declared)) && Number(declared) <= maximumBytes);
}

export async function anonymousVisitorKey(request, secret) {
  const address = request.headers.get('CF-Connecting-IP') ?? 'local-development';
  return sign(secret, `visitor:${address}`);
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
