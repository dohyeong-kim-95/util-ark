/**
 * Fires a fire-and-forget funnel beacon for a tool's own usage funnel —
 * separate from the page-view/qualify beacon in BaseLayout.astro, which
 * counts visits to any page. Mirrors that beacon's transport (sendBeacon,
 * falling back to a keepalive fetch) so the same privacy exclusions
 * (DNT/GPC, the notrack cookie, bot detection) apply identically: they are
 * enforced server-side in worker/index.js, not here.
 *
 * The event name is a step in a tool's funnel (e.g. "selected",
 * "compressed", "downloaded"), never anything about the file itself —
 * no name, no dimensions, no image data.
 */
// Not under /api/analytics/ — that substring is exactly what generic
// ad-block and tracking-protection filter lists match on, first-party or
// not, so a beacon sent there can be silently eaten by the visitor's own
// browser before it ever reaches the server. See worker/index.js.
const ENDPOINT = '/api/usage/event';

export function trackToolEvent(tool: string, event: string): void {
  try {
    const payload = JSON.stringify({ tool, event });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([payload], { type: 'application/json' }));
      return;
    }
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Analytics must never break the tool it is watching.
  }
}
