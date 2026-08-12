import { parseCookies, sign } from './security.js';

const BOT_USER_AGENT = /(?:bot|crawler|spider|slurp|bingpreview|headlesschrome|lighthouse|pagespeed|pingdom|uptimerobot|facebookexternalhit|whatsapp|telegrambot|discordbot|slackbot|curl\/|wget\/|python-requests|go-http-client|httpclient|scrapy)/iu;

export const analyticsDay = (now = Date.now()) => new Date(now).toISOString().slice(0, 10);

export function privacyOptOut(request) {
  return request.headers.get('DNT') === '1' || request.headers.get('Sec-GPC') === '1';
}

export function trackingExcluded(request) {
  return parseCookies(request).utilark_notrack === '1';
}

export function likelyBot(request) {
  const cf = request.cf;
  const bot = cf?.botManagement;
  const score = Number(bot?.score);
  if (bot?.verifiedBot || bot?.signedAgent || cf?.verifiedBotCategory) return true;
  if (Number.isFinite(score) && score > 0 && score < 30) return true;

  const userAgent = request.headers.get('User-Agent')?.trim() ?? '';
  return !userAgent || BOT_USER_AGENT.test(userAgent);
}

export function trackablePageView(request, response) {
  if (request.method !== 'GET') return false;
  if (privacyOptOut(request) || trackingExcluded(request)) return false;
  if (request.headers.get('Purpose') === 'prefetch' || request.headers.get('Sec-Purpose') === 'prefetch') return false;
  const destination = request.headers.get('Sec-Fetch-Dest');
  if (destination && destination !== 'document') return false;
  if (response.status < 200 || response.status >= 400) return false;
  return (response.headers.get('Content-Type') ?? '').toLowerCase().startsWith('text/html');
}

export async function dailyVisitorKey(request, secret, day = analyticsDay()) {
  const address = request.headers.get('CF-Connecting-IP') ?? 'local-development';
  const userAgent = request.headers.get('User-Agent')?.trim() ?? 'unknown-agent';
  return sign(secret, `analytics:${day}:${address}\n${userAgent}`);
}
