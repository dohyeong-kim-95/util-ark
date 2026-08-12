import { dashboardPage, loginPage, unavailablePage } from './admin-page.js';
import { ContactStore } from './contact-store.js';
import {
  anonymousVisitorKey,
  declaredBodyFits,
  issueSession,
  jsonResponse,
  parseCookies,
  safeCredentialMatch,
  sameOriginMutation,
  validSession,
  withSecurityHeaders,
} from './security.js';

export { ContactStore };

const ADMIN_HOST = 'admin.utilark.app';
const ADMIN_COOKIE = 'utilark_admin';
const CONTACT_MAX_BYTES = 8 * 1024;
const categories = new Set(['bug', 'tool', 'feedback', 'other']);

const contactStub = (env) => env.CONTACTS.get(env.CONTACTS.idFromName('global'));

const html = (body, status = 200) => new Response(body, {
  status,
  headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
});

const redirect = (location, headers = {}) => new Response(null, {
  status: 303,
  headers: { Location: location, ...headers },
});

const adminConfigured = (env) => Boolean(env.ADMIN_ID && env.ADMIN_PASSWORD && env.ADMIN_SESSION_SECRET);

const adminCookie = (token, secure = true) =>
  `${ADMIN_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400${secure ? '; Secure' : ''}`;

async function consumeRateLimit(request, env, options) {
  const secret = env.ADMIN_SESSION_SECRET;
  if (!secret) return { allowed: false, unavailable: true };
  const visitorKey = await anonymousVisitorKey(request, secret);
  const response = await contactStub(env).fetch('https://contacts.internal/rate-limit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...options, visitorKey }),
  });
  return response.json();
}

async function handleContact(request, env) {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'method_not_allowed' }, { status: 405, headers: { Allow: 'POST' } });
  }
  if (!env.CONTACTS || !env.ADMIN_SESSION_SECRET) {
    return jsonResponse({ error: 'contact_unavailable' }, { status: 503 });
  }
  if (!sameOriginMutation(request)) return jsonResponse({ error: 'invalid_origin' }, { status: 403 });
  if (!declaredBodyFits(request, CONTACT_MAX_BYTES)) return jsonResponse({ error: 'request_too_large' }, { status: 413 });
  if (!(request.headers.get('Content-Type') ?? '').toLowerCase().startsWith('application/json')) {
    return jsonResponse({ error: 'json_required' }, { status: 415 });
  }

  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > CONTACT_MAX_BYTES) {
    return jsonResponse({ error: 'request_too_large' }, { status: 413 });
  }
  const body = (() => { try { return JSON.parse(raw); } catch { return null; } })();
  if (!body) return jsonResponse({ error: 'invalid_json' }, { status: 400 });
  if (String(body.website ?? '').trim()) return jsonResponse({ ok: true }, { status: 202 });

  const locale = body.locale === 'ko' ? 'ko' : body.locale === 'en' ? 'en' : null;
  const category = categories.has(body.category) ? body.category : null;
  const email = String(body.email ?? '').trim();
  const message = String(body.message ?? '').trim();
  const emailValid = !email || (email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email));
  if (!locale || !category || !emailValid || message.length < 10 || message.length > 4000 || body.consent !== true) {
    return jsonResponse({ error: 'invalid_fields' }, { status: 400 });
  }

  const visitorKey = await anonymousVisitorKey(request, env.ADMIN_SESSION_SECRET);
  const response = await contactStub(env).fetch('https://contacts.internal/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ visitorKey, contact: { locale, category, email, message } }),
  });
  return new Response(response.body, { status: response.status, headers: response.headers });
}

async function handleAdmin(request, env, url) {
  if (!adminConfigured(env)) return html(unavailablePage(), 503);
  const session = parseCookies(request)[ADMIN_COOKIE];
  const authenticated = await validSession(env.ADMIN_SESSION_SECRET, session);
  const secure = url.protocol === 'https:';

  if (url.pathname === '/login' && request.method === 'POST') {
    if (!sameOriginMutation(request) || !declaredBodyFits(request, 4096)) return html(loginPage(true), 403);
    const rate = await consumeRateLimit(request, env, { scope: 'admin-login', limit: 5, windowMs: 15 * 60 * 1000 });
    if (!rate.allowed) {
      return html(loginPage(true), rate.unavailable ? 503 : 429);
    }
    const form = await request.formData().catch(() => null);
    const [idMatches, passwordMatches] = await Promise.all([
      safeCredentialMatch(env.ADMIN_SESSION_SECRET, form?.get('id'), env.ADMIN_ID),
      safeCredentialMatch(env.ADMIN_SESSION_SECRET, form?.get('password'), env.ADMIN_PASSWORD),
    ]);
    if (!idMatches || !passwordMatches) return html(loginPage(true), 401);
    return redirect('/', { 'Set-Cookie': adminCookie(await issueSession(env.ADMIN_SESSION_SECRET), secure) });
  }

  if (url.pathname === '/logout' && request.method === 'POST') {
    if (!sameOriginMutation(request)) return new Response('forbidden', { status: 403 });
    return redirect('/', {
      'Set-Cookie': `${ADMIN_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure ? '; Secure' : ''}`,
    });
  }

  if (!authenticated) {
    if (url.pathname.startsWith('/api/')) return jsonResponse({ error: 'unauthorized' }, { status: 401 });
    return html(loginPage(false));
  }

  if (url.pathname === '/' && request.method === 'GET') return html(dashboardPage());

  if (url.pathname === '/api/contacts' && request.method === 'GET') {
    const internal = new URL('https://contacts.internal/contacts');
    if (url.searchParams.get('status')) internal.searchParams.set('status', url.searchParams.get('status'));
    return contactStub(env).fetch(internal);
  }

  const match = url.pathname.match(/^\/api\/contacts\/([0-9a-f-]+)$/u);
  if (match && ['PATCH', 'DELETE'].includes(request.method)) {
    if (!sameOriginMutation(request)) return jsonResponse({ error: 'invalid_origin' }, { status: 403 });
    const target = `https://contacts.internal/contacts/${encodeURIComponent(match[1])}`;
    if (request.method === 'DELETE') return contactStub(env).fetch(target, { method: 'DELETE' });
    if (!declaredBodyFits(request, 1024) || !(request.headers.get('Content-Type') ?? '').startsWith('application/json')) {
      return jsonResponse({ error: 'invalid_request' }, { status: 400 });
    }
    const body = await request.text();
    return contactStub(env).fetch(target, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
  }

  return new Response('not found', { status: 404 });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const isAdmin = url.hostname === ADMIN_HOST || (url.hostname === 'localhost' && url.pathname.startsWith('/__admin'));
    if (isAdmin) {
      if (url.hostname === 'localhost') url.pathname = url.pathname.replace(/^\/__admin/u, '') || '/';
      const response = await handleAdmin(new Request(url, request), env, url);
      return withSecurityHeaders(response, { admin: true });
    }

    let response;
    if (url.pathname === '/api/contact') response = await handleContact(request, env);
    else response = await env.ASSETS.fetch(request);
    return withSecurityHeaders(response);
  },
};
