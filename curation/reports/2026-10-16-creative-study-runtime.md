# Canonical PicoRunner checks — 16 October 2026

Five canonical GitHub imports were exercised through PicoRunner 0.3.14 on macOS 26.6.2 (25G83), Apple Silicon arm64. The runtime worker performed installation, native development-server launch, browser task checks, Stop/Start persistence checks and final Stop. These observations cover the recorded commits and native `dev` scripts. They do not verify the proposed production manifests, managed updates, every feature, or future upstream changes.

The publication worker independently checked the supplied archive, all 87 archive/per-app SHA-256 assertions, exact package and license bytes against the recorded Git commits, SVG content, PNG dimensions and SQL structure. It did not repeat the desktop tests. Library evidence: `PicoRunner-Mac-validation-2026-10-16.zip`, version 0; archive SHA-256 `e00c532c1d6d46897e167b2f7b8a92ec9650f8e8a726681c4b52bfd39570f294`. Personal paths and local app identifiers are omitted here. Exported test data is synthetic.

## Catalog eligibility correction

Four consumer apps are eligible in this draft: Tela, Shotcandy, Habit Tracker and Smart Study Timer. drawDB was selected by the assistant as a scouting fallback; the user did not select it. The earlier owner-selection assertion was incorrect.

The [current curator rule](https://github.com/bigmints/oven-web/blob/144ed0bc4bc5dee9687151ec3c363e0b7580e862/skills/oven-curator/SKILL.md) says: "Exclude developer tools, API clients, database designers, formatters, coding utilities, DevOps dashboards and homelab administration." It also says: "A user may choose an unusual app despite its score; record the tradeoff." That second sentence concerns scoring; it does not authorize an assistant-selected developer-tool fallback. The catalog contract requires `editorial.audience` to be `consumer`.

The user's broad request to prioritize consumer apps and add five more does not explicitly override the database-designer exclusion. drawDB therefore remains outside the eligible catalog. Its successful runtime test is preserved below without asserting consumer fit. The fifth eligible addition remains outstanding.

## Selection assessment

Scores are curator judgments from 0–2 for usefulness, local value, setup fit, first-use clarity and maintenance confidence, respectively; they are not performance measurements or guarantees.

| App | Scores / total | Rationale |
| --- | --- | --- |
| Tela | 2, 2, 2, 1, 1 / 8 | Useful social design and local project storage; canonical setup passed. Explicit saving is necessary, and upstream makes no roadmap commitment. |
| Shotcandy | 2, 2, 2, 2, 1 / 9 | Distinct screenshot styling and local export workflow; native setup and core task passed. Required automated-suite failures limit wider confidence. |
| Habit Tracker | 2, 2, 2, 2, 1 / 9 | Clear everyday habit task, browser-owned records and straightforward setup; completed portfolio-demo maintenance caveat remains. |
| Smart Study Timer | 2, 2, 2, 2, 1 / 9 | Clear focused-study workflow, local state and simple setup; small project's longer-term maintenance remains uncertain. |
| drawDB | 2, 2, 2, 1, 2 / 9 | Useful local schema design and SQL export with active source maintenance; database knowledge is required. Developer-facing scouting fallback selected by the assistant; excluded from the eligible consumer catalog. |

## Shared limits and cleanup

All five install jobs completed at attempt zero and recorded that the process survived repeated readiness checks. Browser access and page reload corroborated readiness. Process-level listener ownership was not independently proven in every case; specifically, Tela's `lsof` check found no listener while the UI showed running. No socket-binding claim follows from these observations.

All five test apps were stopped through PicoRunner after their checks. Managed sources and synthetic browser data were retained, not uninstalled or deleted. The final UI showed 21 installed apps and one pre-existing app running. All 16 previous entries remained, but previous state was not entirely unchanged: a stale list control briefly started a pre-existing app, which was immediately restored to stopped without document edits; a different pre-existing app's recorded port changed with no lifecycle/configuration action issued in this batch, and the cause is unknown. No credentials were created, notification permissions granted, global package-manager settings changed, or optional services provisioned.

## tela

Repository: https://github.com/heyimjames/tela

Tested commit: `7d46c2640c9cbf303676a809f465ae344722508d`. Root package `tela`; `dev` is `vite`; packageManager is `absent (null)`.

- **Install:** Canonical URL import completed in 22 seconds, attempt zero, with no manual source patch. The installer modified `package-lock.json`; locked/reproducible native installation is not claimed.
- **Launch:** PicoRunner selected `npm run dev -- --port 20493`.
- **Health:** Native readiness checks completed and the UI was usable at `http://localhost:20493/`; browser reload was exercised during restart verification.
- **Smoke:** Created canvas, edited text, bolded and centered it; exported SVG containing expected text.
- **Restart:** Initial edit/export then Stop/Start retained library filename but reopened blank canvas. Repeated with explicit Save version and returning to Files: reload and second Stop/Start retained PicoRunner saved canvas check text and one saved version.
- **Cleanup:** stopped via PicoRunner; test file and managed source retained. No uninstall or browser-data removal is claimed.

Usability requirement: explicitly choose **Save version**, then return to **Files**, before stopping. Initial edit/export alone retained the filename but reopened a blank canvas; the explicit-save retry retained the expected text and one version. AI Assist was not configured or tested.

Export `canvas-export.svg`: 986 bytes, SHA-256 `fbd8242fbdec531a87d25c4be5fcfbb64580ca1071722eea5037c7ce4afb2412`.

Independent XML parsing found `PicoRunner canvas check` in the exported SVG. The later saved-version retry used `PicoRunner saved canvas check`; these are distinct observations.

## shotcandy

Repository: https://github.com/btahir/shotcandy

Tested commit: `51bc02994b63327fe14a742bae80ef15e43a3ae2`. Root package `shotcandy`; `dev` is `next dev`; packageManager is `pnpm@11.1.1`.

- **Install:** Canonical URL import completed in 39 seconds, attempt zero, with no manual source patch. Tracked source files remained unchanged; PicoRunner metadata was added.
- **Launch:** PicoRunner selected `pnpm run dev --port 22685`.
- **Health:** Native readiness checks completed and the UI was usable at `http://localhost:22685/`; browser reload was exercised during restart verification.
- **Smoke:** Loaded built-in dashboard screenshot, applied Paper style, rendered3324x2244 preview, exported PNG (4743688bytes) and .shotcandy project.
- **Restart:** After PicoRunner Stop/Start and page reload, More > Recent designs showed Paper. Reopened with same Paper style and3324x2244 preview.
- **Cleanup:** stopped via PicoRunner; synthetic recent design and managed source retained. No uninstall or browser-data removal is claimed.

PicoRunner selected pnpm; requested packageManager pnpm@11.1.1. Shell pnpm was10.29.3. Actual child manager version not independently established; no global manager/security settings changed.

Export `sample-export.png`: 4743688 bytes, SHA-256 `4af264a93202989a4569a02d431a4716a99a4559addf79e376dd7bb18ac8aae9`.

Export `sample-project.shotcandy`: 258345 bytes, SHA-256 `9b18f3547b7e6685ce6da99e6536bec3b41f1f80e4a1fd794dae9d45c4421ddd`.

Independent PNG header parsing confirmed 3324 × 2244 pixels. Separate publication checks passed locked installation, typecheck, lint, 512 unit tests and production build. The full unmodified required `pnpm test:e2e` command completed with exit code 1: **584 passed, 161 skipped, 10 failed** across engine, Chromium app, Firefox app and WebKit app projects. There was no overall task cutoff or test filtering. Failures covered worker export routing (2), GIF/caption behavior (2), recording controls (4) and filename-token insertion in Firefox/WebKit (2). Required test servers exited and their two ports were confirmed closed; failure traces were preserved. Root cause and unchanged-base reproduction were not established. The upstream integration PR is held; this does not erase the narrower native browser sanity result.

## habit-tracker

Repository: https://github.com/jcortesdev/habit-tracker

Tested commit: `2d856b098f8903546b1d499675d48103da495594`. Root package `habit-tracker`; `dev` is `next dev --webpack`; packageManager is `absent (null)`.

- **Install:** Canonical URL import completed in 52 seconds, attempt zero, with no manual source patch. Tracked source files remained unchanged; PicoRunner metadata was added.
- **Launch:** PicoRunner selected `pnpm run dev --port 28125`.
- **Health:** Native readiness checks completed and the UI was usable at `http://localhost:28125/`; browser reload was exercised during restart verification.
- **Smoke:** Created PicoRunner test stretch, marked done today, observed one-day streak and1/7days marked. Demo data unchanged.
- **Restart:** PicoRunner Stop/Start followed by page reload retained named habit, checked state, one-day streak and1/7days marked.
- **Cleanup:** stopped via PicoRunner; test habit and managed source retained. No uninstall or browser-data removal is claimed.

PWA installation, exhaustive offline behavior, production build and automated tests not performed.

## smart-study-timer

Repository: https://github.com/mrinamoto/smart-study-timer

Tested commit: `3c6d4cbfc5729d4af44735aed98412a41dc43f30`. Root package `smart-study-timer`; `dev` is `vite`; packageManager is `absent (null)`.

- **Install:** Canonical URL import completed in 16 seconds, attempt zero, with no manual source patch. Tracked source files remained unchanged; PicoRunner metadata was added.
- **Launch:** PicoRunner selected `npm run dev -- --port 34243`.
- **Health:** Native readiness checks completed and the UI was usable at `http://localhost:34243/`; browser reload was exercised during restart verification.
- **Smoke:** Set Study duration1 minute, disabled completion sound, kept notifications off, switched light theme, started and let session finish naturally. Today sessions1, focus minutes1, cycle1/4, short break ready5:00.
- **Restart:** After native Stop/Start and page reload: sessions1, focus minutes1, short break mode, Study duration1, light theme, soundoff, notificationsoff retained.
- **Cleanup:** stopped via PicoRunner; synthetic settings and session statistics retained. No uninstall or browser-data removal is claimed.

No notification permission, no full25minute session, no automated test/build suite.

## drawdb

Repository: https://github.com/drawdb-io/drawdb

Tested commit: `7683bdf90a8db5d284dc6b2bc545831aa4b6dd76`. Root package `drawdb`; `dev` is `vite`; packageManager is `absent (null)`.

- **Install:** Canonical URL import completed in 21 seconds, attempt zero, with no manual source patch. Tracked source files remained unchanged; PicoRunner metadata was added.
- **Launch:** PicoRunner selected `npm run dev -- --port 44951`.
- **Health:** Native readiness checks completed and the UI was usable at `http://localhost:44951/editor`; browser reload was exercised during restart verification.
- **Smoke:** Created SQLite diagram PicoRunner disposable schema, tables pico_authors(id) and pico_books(id,author_id); INTEGER column types; dragged books.author_id to authors.id, observed2tables/1relationship/0problems; saved and exported SQL.
- **Restart:** After native Stop/Start and browser reload: named diagram, both named tables,1relationship and0problems retained.
- **Cleanup:** stopped via PicoRunner; synthetic diagram and managed source retained. No uninstall or browser-data removal is claimed.

Downloaded DDL executed successfully against temporary SQLite :memory:; schema contained both tables and FK pico_books.author_id -> pico_authors.id, NO ACTION update/delete. No external database connected.

No backend, sharing, external database, production build or full automated suite. Source includes Vercel Analytics; no telemetry-free claim.

Export `schema-export.sql`: 302 bytes, SHA-256 `c5e1358970c07e7d4b57946862023493b260f3dd29c7a4a6797db7d2daff8cfd`.

Independent execution of the exported DDL in an isolated in-memory SQLite database created `pico_authors` and `pico_books` with `pico_books.author_id` referencing `pico_authors.id`; no external database was contacted. This database design tool was selected by the assistant during scouting, not named or explicitly approved by the user. Its runtime evidence is retained for reference, but it is excluded from the eligible consumer catalog pending a user decision to override that scope or selection of a qualifying replacement.

