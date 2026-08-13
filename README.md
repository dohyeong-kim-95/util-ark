# Utilark

Private-by-default browser utilities for [utilark.app](https://utilark.app), maintained in English and Korean.

## Included in the first release

- Image converter: JPG, PNG, and WebP conversion in the browser
- Word and character counter: words, characters, lines, and UTF-8 bytes
- PDF merger: reorder and combine PDF files with `pdf-lib` in the browser
- Ladder game: assign outcomes to people with a random ladder drawn in SVG
- Localized `/en/` and `/ko/` routes with matching policy and help pages
- Canonical URLs, `hreflang`, Open Graph metadata, JSON-LD, sitemap, and robots.txt
- Private bilingual contact form with an independent Utilark admin inbox
- Privacy-preserving 90-day DAU, page-view, and excluded-bot totals in Utilark Admin
- Optional AdSense loading, generated `ads.txt`, and advertising disclosures in both privacy policies

No selected file or text entered into a tool is sent to Utilark. The contact form is the explicit exception: its message and optional reply email are sent to the Utilark Worker and retained for up to 180 days.

## Local development

Node.js 22.12 or newer is required.

```bash
npm install
npm run dev
```

Before publishing a change:

```bash
npm test
```

The test command runs Astro type checks, generates the static site, and verifies the built localized pages for core SEO metadata.

## Environment variables

Copy `.env.example` only when advertising is ready to be enabled:

```text
PUBLIC_ADSENSE_CLIENT=ca-pub-0000000000000000
PUBLIC_ADSENSE_SLOT=0000000000
```

`PUBLIC_ADSENSE_CLIENT` alone loads the AdSense script, which is what the review needs before an ad unit exists. An ad unit is rendered only when `PUBLIC_ADSENSE_SLOT` is also present, so the two variables can be set in that order.

Both are read at build time, so production values live in **Settings → Secrets and variables → Actions → Variables** as the repository variables `PUBLIC_ADSENSE_CLIENT` and `PUBLIC_ADSENSE_SLOT`. They are publisher identifiers rather than credentials, so they are repository variables, not secrets. A deployment made without them produces a site with no advertising code at all.

`/ads.txt` is generated from `PUBLIC_ADSENSE_CLIENT` during the build. Without the variable it stays a comment-only file that authorizes nobody, and `npm test` enforces both states.

### AdSense review checklist

1. Set the `PUBLIC_ADSENSE_CLIENT` repository variable and deploy, so the review script and `/ads.txt` are live.
2. Confirm `https://utilark.app/ads.txt` lists the publisher ID and that the site root serves a `302` to a localized home.
3. In the AdSense console, open **Privacy and messaging** and publish a GDPR message and a US state regulations message. Google's certified consent message is delivered through the same `adsbygoogle.js` tag, so no extra script belongs in this repository — publishing the message in the console is what makes advertising in the EEA, the UK, and Switzerland compliant.
4. After approval, add `PUBLIC_ADSENSE_SLOT` to render the ad unit on tool pages.

## Routes

- `/` — `302` to `/en/` or `/ko/`, chosen from the `utilark_lang` cookie and then `Accept-Language`
- `/en/`, `/ko/` — localized home pages
- `/en/tools/{tool}/`, `/ko/tools/{tool}/` — localized tool pages
- Localized about, privacy, terms, and contact pages
- `{tool}.utilark.app/` — `302` to that tool's localized page, chosen the same way as `/`; any other path on a subdomain is `301`ed to the same path on `utilark.app`

The Astro site is served by the Utilark Worker together with the contact API and a separate admin hostname. It does not use shared Bubblelab infrastructure.

## Cloudflare deployment

Production uses an independent Cloudflare Worker named `utilark`. Pushes to `main` deploy through GitHub Actions after all checks pass.

Add these repository secrets under **Settings → Secrets and variables → Actions**:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN` — use a Utilark-specific token with Workers Scripts edit access

The workflow creates or updates the Worker through Wrangler. Custom domains are managed in the Cloudflare dashboard so code deployments do not require zone route permissions or overwrite domain settings. Attach them under the Worker's **Domains → Add → Custom Domain** menu.

The production custom domains are:

- `utilark.app` — public site and `POST /api/contact`
- `admin.utilark.app` — noindex administrator login and contact inbox
- One short entry-point subdomain per tool, such as `mergepdf.utilark.app`, plus names reserved for conversion pages that do not exist yet, such as `png2jpg.utilark.app`

Every tool subdomain redirects to a localized page on `utilark.app` rather than serving its own copy, so indexing, link signals, the sitemap, and the AdSense site registration stay on one host. `docs/subdomains.md` has the full map, the redirect rules, and the dashboard steps; `worker/subdomains.js` is the source of truth, and `npm test` fails if it drifts from the tools that were built.

Contact records use a Utilark-only SQLite-backed Durable Object. Tool files and tool text never enter this storage. Records expire after 180 days, and public submissions are rate-limited using an HMAC value instead of storing the source IP address.

Anonymous usage totals use a day-scoped HMAC of the connection IP and user-agent to deduplicate DAU without storing either original value or a cross-day visitor ID. Bot signals and common bot user-agents are excluded, DNT/GPC requests are skipped, and aggregate records expire after 90 days. Collection begins only after deployment and does not backfill earlier traffic.

The localized home-page footer publishes Today, Week, and Month visitor-day totals. Week and Month are sums of daily deduplicated counts, not cross-day unique-user figures. Authenticated admins can set a five-year, domain-wide HttpOnly exclusion cookie so their current browser is omitted from future counts.

Before the admin and contact form can open, add these encrypted Worker secrets under **Workers & Pages → utilark → Settings → Variables and Secrets**:

- `ADMIN_PASSWORD` — a unique administrator password
- `ADMIN_SESSION_SECRET` — a long random value used to sign sessions and anonymize rate-limit keys

`ADMIN_ID` is the non-secret value `admin` in `wrangler.jsonc`. Missing secrets fail closed: the admin returns 503 and contact submissions are not stored.

## Bubblelab migration boundary

The original Bubblelab `util` directory was reviewed as a source of product ideas, not copied as shared infrastructure.

- Migrated first: image conversion and browser-side PDF merging
- Migrated next: the ladder game, reimplemented on this site's components without the original `localStorage` persistence, so it matches the privacy policy statement that tool state is cleared on refresh
- Parked: a timed flashcard drill on `claude/flashcards-tool`, which has no Bubblelab counterpart
- Reframed first: a language-neutral word/character counter before migrating the Korean-specific proofreader
- Remaining browser-only candidates: calendar, photo tools, stars, passport photo
- Excluded: lotto, because AdSense restricts gambling-related content and the site is applying for review
- Separate infrastructure required: brief, fortune, planner, and chat
- Separate administration required for any future content, user, ad, or server-operated feature

## Repository policy

This is a public source repository. No open-source license is granted unless a `LICENSE` file is added later. Do not commit secrets, production identifiers, user data, or private documents.
