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
export function trackToolEvent(tool: string, event: string): void {
  try {
    const payload = JSON.stringify({ tool, event });
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/tool-event', new Blob([payload], { type: 'application/json' }));
      return;
    }
    fetch('/api/analytics/tool-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Analytics must never break the tool it is watching.
  }
}
