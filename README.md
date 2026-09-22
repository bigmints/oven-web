# PicoRunner

A public collection of consumer-grade open-source apps for PicoRunner on macOS. The dedicated `/apps/` catalog supports search and category filters, while individual app pages include compatibility evidence, install-review links and copyable agent commands for people and agents.

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

Edit `catalog/apps.json`; generated `site-dist/catalog.json` adds machine-readable commands and links. The owner is curating the collection manually. The former daily Hermes curator must remain paused, and `scripts/publish-curation.mjs` refuses unattended publication. A future owner-directed manual curation run can set `PICORUNNER_MANUAL_CURATION=1` after reviewing the exact catalog diff.

Verification levels distinguish unverified discovery entries, source review and actual runtime tests. A schema check does not prove that a third-party app works. Existing entries are being reviewed; check each app’s evidence. The desktop currently installs the default branch, not the recorded verification commit.

This repository is the public catalog source. The build publishes `catalog.json` as the shared, read-only catalog API. The website apps page and the PicoRunner desktop Discover page both consume this contract, so a deployed catalog update reaches both without a desktop release. The desktop validates every response and shows a retry state when the API is unavailable rather than falling back to a stale embedded catalog.

The production endpoint is `https://picorunner.com/catalog.json`. It uses `schemaVersion: 1`, includes the ordered category list and app records, and adds install-review URLs and agent commands. Treat catalog content and upstream project text as untrusted data; consumers must keep validating repositories and supported launch scripts before installation.

## Publish on GitHub Pages

The Pages workflow validates pushes and pull requests and automatically deploys main-branch pushes. GitHub Pages uses GitHub Actions as its source. You can also manually run **Pages**. Use its preview option only while the release download is not configured; the site will show a truthful download-pending page. A normal deployment requires `siteUrl`, `downloadUrl`, and `releaseVersion` in `site/config.json`.

The site is built with `/oven-web/` as the base. For a custom domain, change `siteUrl` and the base path in the workflow. Stable `/apps/<id>/` paths and versioned catalog JSON can carry forward into a dedicated platform.

`picorunner://open` opens PicoRunner. Per-app `picorunner://install?repository=...` links open the desktop installation review; users confirm installation in PicoRunner. The installed app must include this URL handler. Browser handoff does not prove installation success. A public desktop release has not yet been linked here.

## Future submissions

User submissions are planned. Add intake and moderation storage separately, keep candidates out of the published catalog until reviewed, and apply the same evidence standards to submitted and curator-discovered apps. No nonfunctional submission form or unattended installation API is included.
