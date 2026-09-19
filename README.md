# Oven

A public collection of consumer-grade open-source apps for Oven on macOS. The dedicated `/apps/` catalog supports search and category filters, while individual app pages include compatibility evidence, install-review links and copyable agent commands for people and agents.

## Run locally

Requires Node.js 22 or newer; no dependency installation is needed.

```sh
node scripts/validate-catalog.mjs
node --test scripts/site.test.mjs
SITE_BASE_PATH=/ node scripts/build-site.mjs
node scripts/preview-site.mjs
```

Open http://127.0.0.1:4178/. For a project-path preview, use `SITE_BASE_PATH=/oven-web/` for both builder and preview server.

## Maintain the catalog

Edit `catalog/apps.json`; generated `site-dist/catalog.json` adds machine-readable commands and links. Read `skills/oven-curator/SKILL.md` for the evidence-based review workflow. Copy that complete folder to `~/.hermes/skills/oven-curator/` to make it available in Hermes. The skill is installed on ubot-server for a daily native Hermes job. The job researches everyday consumer apps and automatically publishes qualifying source-reviewed listings. It does not execute candidate app code.

Verification levels distinguish unverified discovery entries, source review and actual runtime tests. A schema check does not prove that a third-party app works. Existing entries are being reviewed; check each app’s evidence. The desktop currently installs the default branch, not the recorded verification commit.

This repository is the public catalog source. The desktop includes a release-time snapshot of `catalog/apps.json`; updates must be imported into its source before the next desktop release. There is no automatic cross-repository update channel yet.

## Publish on GitHub Pages

The Pages workflow validates pushes and pull requests and automatically deploys main-branch pushes. GitHub Pages uses GitHub Actions as its source. You can also manually run **Pages**. Use its preview option only while the release download is not configured; the site will show a truthful download-pending page. A normal deployment requires `siteUrl`, `downloadUrl`, and `releaseVersion` in `site/config.json`.

The site is built with `/oven-web/` as the base. For a custom domain, change `siteUrl` and the base path in the workflow. Stable `/apps/<id>/` paths and versioned catalog JSON can carry forward into a dedicated platform.

`oven://open` opens Oven. Per-app `oven://install?repository=...` links open the desktop installation review; users confirm installation in Oven. The installed app must include this URL handler. Browser handoff does not prove installation success. A public desktop release has not yet been linked here.

## Future submissions

User submissions are planned. Add intake and moderation storage separately, keep candidates out of the published catalog until reviewed, and apply the same evidence standards to submitted and curator-discovered apps. No nonfunctional submission form or unattended installation API is included.
