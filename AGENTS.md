# Repository guidelines

- Keep Utilark independent from Bubblelab infrastructure, deployment, and administration.
- When asked to check how Bubblelab does something, read it. It is a separate repository and is not attached to a session by default, so attach `dohyeong-kim-95/bubblelab` with `add_repo` (read access is enough) and clone it before answering. Do not describe its setup from memory or assume this repository's conventions match it — the wildcard subdomain route in `wrangler.jsonc` came from reading it and replaced eleven manual dashboard steps. Read it for patterns and product ideas; the independence rule above still governs what may be adopted.
- Prefer browser-only processing. Do not add file uploads, an API, a database, accounts, analytics, or remote processing without an explicit architecture and privacy review.
- Maintain English and Korean route parity. A public page or tool is incomplete until both languages have equivalent navigation, instructions, help content, and metadata.
- Give every indexable page a unique title, description, canonical URL, matching `hreflang` links, and useful visible content.
- Do not enable advertising by hard-coding publisher IDs. Use documented environment variables only after consent and privacy requirements are reviewed.
- Do not commit secrets, personal data, real user files, or production exports.
- Run `npm test` before committing.
