# Utilark

Private-by-default browser utilities for [utilark.app](https://utilark.app), maintained in English and Korean.

## Included in the first release

- Image converter: JPG, PNG, and WebP conversion in the browser
- Word and character counter: words, characters, lines, and UTF-8 bytes
- PDF merger: reorder and combine PDF files with `pdf-lib` in the browser
- Localized `/en/` and `/ko/` routes with matching policy and help pages
- Canonical URLs, `hreflang`, Open Graph metadata, JSON-LD, sitemap, and robots.txt
- Private bilingual contact form with an independent Utilark admin inbox
- Optional AdSense loading through public environment variables after approval and consent review

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

If either variable is absent, Utilark does not load the AdSense script or render an ad unit. Adding advertising also requires an appropriate consent flow and an updated privacy review for the target regions.

## Routes

- `/` — language selector; excluded from indexing
- `/en/`, `/ko/` — localized home pages
- `/en/tools/{tool}/`, `/ko/tools/{tool}/` — localized tool pages
- Localized about, privacy, terms, and contact pages

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

Contact records use a Utilark-only SQLite-backed Durable Object. Tool files and tool text never enter this storage. Records expire after 180 days, and public submissions are rate-limited using an HMAC value instead of storing the source IP address.

Before the admin and contact form can open, add these encrypted Worker secrets under **Workers & Pages → utilark → Settings → Variables and Secrets**:

- `ADMIN_PASSWORD` — a unique administrator password
- `ADMIN_SESSION_SECRET` — a long random value used to sign sessions and anonymize rate-limit keys

`ADMIN_ID` is the non-secret value `admin` in `wrangler.jsonc`. Missing secrets fail closed: the admin returns 503 and contact submissions are not stored.

## Bubblelab migration boundary

The original Bubblelab `util` directory was reviewed as a source of product ideas, not copied as shared infrastructure.

- Migrated first: image conversion and browser-side PDF merging
- Reframed first: a language-neutral word/character counter before migrating the Korean-specific proofreader
- Later browser-only candidates: calendar, ladder, photo tools, stars, lotto, passport photo
- Separate infrastructure required: brief, fortune, planner, and chat
- Separate administration required for any future content, user, ad, or server-operated feature

## Repository policy

This is a public source repository. No open-source license is granted unless a `LICENSE` file is added later. Do not commit secrets, production identifiers, user data, or private documents.
