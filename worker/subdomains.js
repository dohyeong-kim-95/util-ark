export const APEX_HOST = 'utilark.app';
export const ADMIN_HOST = `admin.${APEX_HOST}`;

/**
 * Tool subdomains are entry points, not canonical addresses. Each one redirects
 * to a localized page on the apex host so indexing, link signals, the sitemap,
 * and the AdSense site registration all stay on utilark.app.
 *
 * Naming follows two rules:
 * - a conversion is `{from}2{to}`, matching how these keywords are searched
 * - every other tool gets one plain label
 *
 * `tool` is the slug under `/{locale}/`. `pending` marks a name reserved
 * for a page that does not exist yet, so it lands on the closest tool that
 * already does the job, or on the localized home when there is none. Turning a
 * reserved name into a real destination is a one-line change here.
 */
export const TOOL_SUBDOMAINS = {
  imageconvert: { tool: 'image-converter' },
  mergepdf: { tool: 'merge-pdf' },
  wordcount: { tool: 'word-counter' },
  ladder: { tool: 'ladder' },

  // The pair-split conversion pages these names were reserved for now exist.
  // The subdomain keeps the `{from}2{to}` spelling and the path keeps
  // `{from}-to-{to}`; both are used by ranking competitors.
  jpg2png: { tool: 'jpg-to-png' },
  png2jpg: { tool: 'png-to-jpg' },
  jpg2webp: { tool: 'jpg-to-webp' },
  webp2jpg: { tool: 'webp-to-jpg' },
  png2webp: { tool: 'png-to-webp' },
  webp2png: { tool: 'webp-to-png' },

  // Reserved for a tool that does not exist yet.
  pdf2image: { tool: null, pending: true },
};

/**
 * Tool pages moved from `/{locale}/tools/{slug}/` up to `/{locale}/{slug}/`.
 * The old paths were live, so they are redirected rather than dropped. This is
 * permanent — unlike the language-negotiated subdomain entry points, the
 * destination here does not depend on the request.
 *
 * Returns the new path, or null when the URL is not an old tool page.
 */
export function legacyToolPath(pathname) {
  const match = /^\/(en|ko)\/tools\/([a-z0-9-]+)\/?$/u.exec(pathname);
  return match ? `/${match[1]}/${match[2]}/` : null;
}

/**
 * Classifies an incoming hostname. Anything outside utilark.app — localhost,
 * a preview host, a test harness — is left alone so local development and the
 * worker tests keep working against the normal routes.
 */
export function resolveHost(hostname) {
  const host = String(hostname ?? '').toLowerCase();
  if (host === APEX_HOST) return { kind: 'apex' };
  if (host === ADMIN_HOST) return { kind: 'admin' };
  if (!host.endsWith(`.${APEX_HOST}`)) return { kind: 'external' };

  const label = host.slice(0, -(APEX_HOST.length + 1));
  const entry = TOOL_SUBDOMAINS[label];
  return entry ? { kind: 'tool', label, tool: entry.tool ?? null, pending: entry.pending === true } : { kind: 'unknown', label };
}

/**
 * Builds the redirect off a subdomain. Only the root of a tool subdomain means
 * the tool; every other path is a stray copy of an apex URL and is normalized
 * permanently, which is what keeps a subdomain from becoming a second site.
 *
 * The tool redirect itself is a 302 with `Vary`, matching how the apex root
 * already negotiates language: the destination depends on the request, so a
 * permanent redirect would pin a visitor to whichever language they happened
 * to arrive in first.
 */
export function subdomainRedirect(url, host, locale) {
  const target = new URL(url);
  target.protocol = 'https:';
  target.hostname = APEX_HOST;
  target.port = '';

  if (host.kind !== 'tool' || url.pathname !== '/') {
    return new Response(null, { status: 301, headers: { Location: target.href } });
  }

  target.pathname = host.tool ? `/${locale}/${host.tool}/` : `/${locale}/`;
  return new Response(null, {
    status: 302,
    headers: {
      Location: target.href,
      'Cache-Control': 'no-store',
      Vary: 'Accept-Language, Cookie',
    },
  });
}
