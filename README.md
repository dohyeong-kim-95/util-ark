# Utilark

Private-by-default browser utilities for [utilark.app](https://utilark.app), maintained in English and Korean.

## Included in the first release

- Image converter: JPG, PNG, and WebP conversion in the browser
- Word and character counter: words, characters, lines, and UTF-8 bytes
- PDF merger: reorder and combine PDF files with `pdf-lib` in the browser
- Localized `/en/` and `/ko/` routes with matching policy and help pages
- Canonical URLs, `hreflang`, Open Graph metadata, JSON-LD, sitemap, and robots.txt
- Optional AdSense loading through public environment variables after approval and consent review

No selected file or entered text is sent to Utilark by these tools. There is no API, database, account system, or admin application in this repository.

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

The build is static and host-neutral. Deployment configuration belongs in the infrastructure project or hosting dashboard, not in shared Bubblelab infrastructure.

## Bubblelab migration boundary

The original Bubblelab `util` directory was reviewed as a source of product ideas, not copied as shared infrastructure.

- Migrated first: image conversion and browser-side PDF merging
- Reframed first: a language-neutral word/character counter before migrating the Korean-specific proofreader
- Later browser-only candidates: calendar, ladder, photo tools, stars, lotto, passport photo
- Separate infrastructure required: brief, fortune, planner, and chat
- Separate administration required for any future content, user, ad, or server-operated feature

## Repository policy

This is a public source repository. No open-source license is granted unless a `LICENSE` file is added later. Do not commit secrets, production identifiers, user data, or private documents.
