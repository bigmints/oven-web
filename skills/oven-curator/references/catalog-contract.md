# Catalog contract, version 1

The maintained source is `catalog/apps.json`: `{ "schemaVersion": 1, "apps": [...] }`.
The generated `site-dist/catalog.json` adds launcher information and derived links/commands; never edit generated output. The schema and deterministic checks live in `scripts/catalog-contract.mjs`; run `node scripts/validate-catalog.mjs` after every catalog change.

Each app contains:

- `id`: stable lowercase hyphenated slug, unique across the catalog.
- `name`, `description`, `glyph`: upstream identity, plain-language purpose, and a short letter icon.
- `category`: Everyday life, Productivity, Creativity, Photos & media, Learning, Personal finance, or Wellbeing. Extend the public contract and desktop category list together when needed.
- `tags`: short relevant search terms; `accent`: six-digit hex color.
- `repository`: canonical `https://github.com/owner/repository`, no query, fragment, credentials, branch or shell syntax.
- `packageName`: actual runnable package name; `preferredScript`: `dev`, `start`, or `serve`. Do not guess through unrelated workspaces.
- `editorial`: `audience` (must be `consumer`), `reason`, `bestFor`, `requirements` (nonempty string array), `license` (SPDX when confirmed, null when unknown).
- `compatibility`: `status`, `checkedAt` (YYYY-MM-DD or null), `commit` (40-character SHA or null), `platform`, `launcherVersion`, `evidence`.

Evidence records are `{ "kind": "source", "source": "https://...", "summary": "What this source establishes" }`. Public commit permalinks support source review. Runtime evidence should link to a public, redacted test report with distinct observations for `install`, `launch`, `health`, `smoke`, `restart`, and `cleanup`. The validator checks presence; the curator must assess truth and quality. A link repeated six times without actual observations is not verification.

Source-reviewed entries also need `compatibility.launch`: `{ "packagePath": "package.json", "packageName": "actual", "script": "start", "command": "yarn start:browser", "packageManager": "yarn@4.17.1" }`. Record the exact values from the pinned upstream manifest, including null when packageManager is absent. Do not replace wrapper commands with what you assume they eventually run. The publisher fetches each pinned manifest and rejects mismatched names, scripts, commands or package-manager declarations. This network check verifies source facts, not installation or usability. Evidence summaries must agree with those facts; do not claim no native dependencies or no external services based solely on a root manifest.

`source-reviewed` and `verified` require date, commit, license and evidence. `verified` additionally requires platform, launcher version and all six runtime kinds. `blocked` needs an evidence record explaining why. Unknown values stay null. Catalog entries migrated from an existing gallery may remain `unverified`, but new entries should normally receive source review first.

The installed desktop currently fetches the repository default branch, not the recorded verification commit. Always show the tested date/commit and the possibility of upstream drift. Do not describe installations as pinned, reproducible or guaranteed. A future pinned install flow requires a new desktop contract and compatibility testing.

Generated command: `open 'picorunner://install?repository=https%3A%2F%2Fgithub.com%2Fowner%2Frepository'`.
Launch only: `open 'picorunner://open'`.
Both require macOS with a built/installed PicoRunner app that registers the `oven` scheme. Install handoff opens review; no unattended install/status API is currently provided. A browser cannot reliably detect app installation and should offer a visible download fallback, not claim launch success.

Publishing uses `site/config.json` for public name, HTTPS site URL, real HTTPS release download URL, source URL and release version. `node scripts/build-site.mjs --release` fails without site URL, download and version. Use `SITE_BASE_PATH=/oven-web/` for GitHub project Pages or `/` for a custom-domain root. A preview build may show a truthful download-pending page.

For the later platform, retain stable IDs and versioned public JSON. Add submissions, moderation state and contributor identity in separate storage; accepted entries are exported into this contract. Avoid changing public URLs when replacing the static renderer or adding accounts.
