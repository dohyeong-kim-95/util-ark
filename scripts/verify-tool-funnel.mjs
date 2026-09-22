/**
 * Manual production smoke test for the Image Compressor funnel beacon
 * (`/api/analytics/tool-event` in worker/index.js) and the tool page view it
 * rides alongside. Not part of `npm test` — it makes real requests against a
 * live deployment and each accepted call adds one real "selected" event to
 * that day's funnel count (deduplicated per visitor per day, so re-running
 * this from the same machine on the same day adds nothing further).
 *
 * Exists because the funnel's same-origin check depends on request headers
 * (Sec-Fetch-Site, Origin) whose real-world presence varies by browser
 * engine in ways a local test environment cannot reproduce — that gap was
 * exactly the bug this script is meant to catch again if it ever recurs.
 *
 * Usage: node scripts/verify-tool-funnel.mjs [baseUrl]
 *   node scripts/verify-tool-funnel.mjs https://utilark.app
 */

const baseUrl = (process.argv[2] || 'https://utilark.app').replace(/\/$/u, '');

const USER_AGENTS = {
  chromium: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  firefox: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:130.0) Gecko/20100101 Firefox/130.0',
  safari: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
};

let failures = 0;
const check = (label, condition, detail = '') => {
  console.log(`[${condition ? 'PASS' : 'FAIL'}] ${label}${detail ? ` — ${detail}` : ''}`);
  if (!condition) failures += 1;
};

async function main() {
  console.log(`Testing against ${baseUrl}\n`);

  // 1. The tool page itself: proves routing and static asset serving reach
  //    it, and text/html is what the server-side "view" step requires.
  const page = await fetch(`${baseUrl}/en/image-compress/`, {
    headers: { 'User-Agent': USER_AGENTS.chromium, 'Sec-Fetch-Dest': 'document' },
  });
  check('tool page responds 200', page.status === 200, `got ${page.status}`);
  check(
    'tool page is served as text/html (required for the view step to record)',
    (page.headers.get('content-type') || '').startsWith('text/html'),
    page.headers.get('content-type') || '(none)',
  );

  // 2. The funnel beacon, once per realistic browser profile. Chromium sends
  //    Sec-Fetch-Site reliably; Safari (WebKit) never sends it and does not
  //    reliably send Origin either on a same-origin sendBeacon POST — the
  //    combination that was silently dropping real visits.
  const profiles = {
    'Chromium (Sec-Fetch-Site present)': {
      'User-Agent': USER_AGENTS.chromium,
      Origin: baseUrl,
      'Sec-Fetch-Site': 'same-origin',
      'Content-Type': 'application/json',
    },
    'Firefox-like (Origin only, no Sec-Fetch-Site)': {
      'User-Agent': USER_AGENTS.firefox,
      Origin: baseUrl,
      'Content-Type': 'application/json',
    },
    'Safari/WebKit (neither header)': {
      'User-Agent': USER_AGENTS.safari,
      'Content-Type': 'application/json',
    },
  };

  for (const [label, headers] of Object.entries(profiles)) {
    const response = await fetch(`${baseUrl}/api/analytics/tool-event`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ tool: 'image-compress', event: 'selected' }),
    });
    check(`beacon accepted for ${label}`, response.status === 202, `got ${response.status}`);
  }

  // 3. A genuinely cross-origin beacon must still be rejected — the fix for
  //    #2 must not have widened who is allowed to post.
  const foreign = await fetch(`${baseUrl}/api/analytics/tool-event`, {
    method: 'POST',
    headers: { Origin: 'https://example.com', 'Sec-Fetch-Site': 'cross-site', 'Content-Type': 'application/json' },
    body: JSON.stringify({ tool: 'image-compress', event: 'selected' }),
  });
  check('a genuinely cross-origin beacon is still rejected', foreign.status === 403, `got ${foreign.status}`);

  console.log(`\n${failures === 0 ? 'All checks passed.' : `${failures} check(s) failed.`}`);
  console.log(
    '\nA 202 above means the Worker accepted and forwarded the event to storage, not that it\n'
    + 'displayed anywhere yet. To confirm it actually reached the Durable Object, log into\n'
    + 'https://admin.utilark.app and check the "Image Compressor 사용 현황" section: today\'s\n'
    + '페이지뷰 count should be at least 1 higher, and 이미지 선택 should be at least 1 higher\n'
    + '(not up to 3, even though three profiles ran above — dedup is per visitor per day, and\n'
    + 'this script runs from one machine).',
  );
  process.exitCode = failures === 0 ? 0 : 1;
}

main().catch((error) => {
  console.error('Smoke test crashed:', error);
  process.exitCode = 1;
});
