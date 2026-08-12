import { parseCookies } from './security.js';

export const LOCALES = ['en', 'ko'];
export const DEFAULT_LOCALE = 'en';
export const LANGUAGE_COOKIE = 'utilark_lang';

export function acceptLanguageLocale(header) {
  const entries = String(header ?? '')
    .split(',')
    .map((part) => {
      const [tag, ...parameters] = part.trim().split(';');
      const quality = parameters.map((value) => value.trim()).find((value) => value.startsWith('q='));
      const weight = quality ? Number(quality.slice(2)) : 1;
      return { tag: tag.trim().toLowerCase(), weight: Number.isFinite(weight) ? weight : 0 };
    })
    .filter((entry) => entry.tag && entry.weight > 0)
    .sort((left, right) => right.weight - left.weight);

  for (const entry of entries) {
    if (entry.tag === '*') break;
    const primary = entry.tag.split('-')[0];
    if (LOCALES.includes(primary)) return primary;
  }
  return DEFAULT_LOCALE;
}

export function preferredLocale(request) {
  const saved = parseCookies(request)[LANGUAGE_COOKIE];
  if (LOCALES.includes(saved)) return saved;
  return acceptLanguageLocale(request.headers.get('Accept-Language'));
}
