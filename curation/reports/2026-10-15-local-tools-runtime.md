# Five local apps: source and Mac sanity checks

Recorded on 2026-10-15. Test host: macOS 26.6.2 (25G83), Apple Silicon arm64; PicoRunner 0.3.14. These are canonical GitHub imports through PicoRunner native discovery, not tests of the proposed upstream production manifests. Each selected the root package and its existing `dev` script: `vite` for OmniTools, Dienius, Web Chess and MoChord; `next dev --turbopack` for PDFCraft. Browser storage belongs to the browser profile and origin. The installed desktop fetches the current default branch, so a later installation can differ from the tested revision.

The initial supplied Mac evidence archive was 85,175 bytes, SHA-256 `bb8edbb074857129de8fe85bb48c93cd2bd83bc4f1f145bb10de87a33217bd1f`. All 17 included file hashes passed. Export bytes were inspected independently. This report omits local paths, registration identifiers, process IDs, raw registries, and browser backup contents. The initial before/after comparison reported all 15 pre-existing apps unchanged.

The runtime owner supplied supplemental result files updated at 12:24:58 UTC: `chess-result.json` SHA-256 `81d2df82cf2f93f6f7cbeeabfc4f9487051785c443867010ed66c1b0bdae5a5d` and `pdfcraft-result.json` SHA-256 `c7f54c0bf1f9036e4d2d1fa9b394dc232dda458402fbfb9360ffb5239d729b73`. These supplements are separate from the earlier archive. Read-only checks independently matched both managed checkout HEADs to the source commits below and found no tracked changes. PDF page count and extracted text were independently compared with the two synthetic input PDFs. At 12:26:05 UTC the recorded Web Chess, PDFCraft and Jotty test ports had no listeners. Runtime testing remained owned by the separate Mac task; publication checks did not operate the UI or change its files/processes.

The subsequent `mochord-result.json`, updated at 12:30:39 UTC, has SHA-256 `11a8020b101c931c89ca3b0caaa950d50f96413a1f2d14cb82ac29edc4df1a32`. Its managed checkout HEAD and unchanged tracked source were independently checked read-only. MoChord evidence describes an observed UI workflow and restart; no exported file is claimed. The runtime owner reported all five selected test apps stopped. These updates use the exact test-owned result files, rather than asserting verification of the separately supplied newer Library archive.

## OmniTools

- Source: [iib0011/omni-tools](https://github.com/iib0011/omni-tools/tree/cf41a30dda37e1f33deeeb03f959295c249c2beb), MIT. Root package `omni-tools`; `dev` is `vite`; no packageManager field.
- Install: canonical GitHub URL, completed through PicoRunner in 26 seconds on attempt zero, Node 24.21.0 and pnpm. No manifest was present. Native pnpm installation changed its lockfile in the disposable managed checkout.
- Launch: PicoRunner ran `pnpm run dev --port <assigned-port>`.
- Health: the managed listener and loaded UI were reachable on IPv6 loopback `localhost`. IPv4 `127.0.0.1` was not bound. An earlier separate local-folder test failed IPv4 readiness; this canonical import succeeded.
- Smoke: sort and deduplicate `zebra,kiwi,apple,kiwi`; downloaded bytes were exactly `apple,kiwi,zebra`. Export SHA-256 `465c2a0dc9c01a824be498436c954b5ef38eaca2f9179f2ee725e5098a96e1c3`.
- Restart: a Sort bookmark survived PicoRunner Stop/Start.
- Cleanup: the synthetic bookmark was removed and the app was stopped through PicoRunner. The managed registration and folder were intentionally retained; no uninstall or permanent deletion was performed.
- Limits: the proposed npm production-manifest route is separate and unverified on Mac. The Updates screen reported updates outside PicoRunner; no managed-update support or occupied-port test is claimed.

Catalog level: **verified**, for the recorded native route and representative sorting task. All six evidence kinds are present; cleanup means the scoped stop and synthetic-content removal described above, not uninstall.

## Dienius

- Source: [dovjonikas/dienius](https://github.com/dovjonikas/dienius/tree/3ad3e1d7fbfaf8bc34fea35f981a39117e3d0944), MIT. Root package `dienius`; `dev` is `vite`; no packageManager field.
- Install: canonical GitHub URL, completed through PicoRunner in 21 seconds on attempt zero, Node 24.21.0 and npm. No generated manifest and no tracked source changes.
- Launch: PicoRunner ran `npm run dev -- --port <assigned-port>`.
- Health: PicoRunner reported running and survived repeated readiness checks; `/dienius/` was reachable on IPv6 loopback `localhost`.
- Smoke: created a synthetic task, completed it, reloaded, and exported a JSON backup. Independent inspection found that exact task with `done: true`. Export SHA-256 `e20983cbe900eff8c9877137bbd31eb0090b6bf2b908a6a1ff617743498868cc`.
- Restart: PicoRunner Stop removed the listener and HTTP failed; Start restored the app at the same origin with the completed task retained.
- Cleanup: the synthetic task was deleted and the app stopped. The managed registration and folder were intentionally retained; no uninstall or permanent deletion was performed.
- Limits: optional sync was excluded. Managed updates were reported unavailable; no update or port-collision verification is claimed.

Catalog level: **verified**, for the recorded native route and representative task workflow. This does not override the upstream repository's contribution gates. Its separate unsubmitted manifest patch remains held: on Mac, the E2E gate had 165 passes, 33 skips and five failures (three fixed-port conflicts and two Control+z undo assertions); the phone sweep reported two findings, with a deduplicated 20px horizontal overflow in the night-shift template editor. Typecheck, build and 3,669 unit tests passed. No app source or tests were changed to suppress these findings.

## Web Chess

- Source: [Sir-Teo/web-chess](https://github.com/Sir-Teo/web-chess/tree/80633718b9875a45ed8b925574d579265e6df212). Application code is MIT; bundled Stockfish assets are GPL-3.0. Root package `web-chess`; `dev` is `vite`; no packageManager field.
- Install: canonical GitHub URL, completed through PicoRunner in 34 seconds on attempt zero using npm and Node 24.21.0. Tracked source files remained unchanged.
- Launch and health: PicoRunner native discovery ran `npm run dev -- --port <assigned-port>`; the UI and local engine were ready on IPv6 loopback `localhost`.
- Smoke: the human move e4 received local Stockfish e5. Exported PGN independently contains `1. e4 e5 *`; the two-ply game was saved to the library. Export SHA-256 `737f8185246de8c81417e8e72deefe5045f1285e99c1c1e9fcec3bed236484fd`.
- Restart: the supplemental record reports PicoRunner Stop removed the listener, Start restored the same origin, and reopening the saved library game restored e4 and e5.
- Cleanup: the app was stopped after restart verification and its listener disappeared. Its managed folder, registration and saved synthetic game were retained; no uninstall or game deletion is claimed.
- Limits: managed updates were reported outside PicoRunner, and the proposed production-preview manifest was not tested on Mac.

Catalog level: **verified**, for the recorded native route and representative local chess workflow. The earlier source-reviewed assessment lacked restart evidence; the supplemental record now supplies it. All six runtime evidence kinds are present.

## PDFCraft

- Source: [PDFCraftTool/pdfcraft](https://github.com/PDFCraftTool/pdfcraft/tree/009569cb169de5dec1900be66bea3a3997945aad), AGPL-3.0. Root package `pdfcraft`; `dev` is exactly `next dev --turbopack`; no packageManager field. The pinned README and license establish the project license; the Free Software Foundation notice in the license text is not attributed to the application authors.
- Install: canonical GitHub URL, completed through PicoRunner in 66 seconds on attempt zero using npm and Node 24.21.0. No manifest was generated and tracked source files remained unchanged.
- Launch: native discovery selected the root `dev` script and PicoRunner ran `npm run dev -- --port <assigned-port>`.
- Health: PicoRunner reported the app running; the Next development server and merge UI were reachable at `/en/` on IPv4 loopback `127.0.0.1`.
- Smoke: merged two synthetic one-page PDFs and downloaded the result. Independent parsing confirmed two pages, in input order, with the exact expected text on each page. The 1,335-byte output has SHA-256 `e216e7195924992b979f6eadeaaa7942a5b0c487aeeacbc6b0df856f94cbe6ec`.
- Restart: PicoRunner Stop removed the listener; Start restored the app and preserved a favorite. The synthetic favorite was removed after the test.
- Cleanup: stopped through PicoRunner; the publication-side listener check also found no listener. The managed folder and synthetic PDF evidence were retained; no uninstall is claimed.
- Limits: Mac sanity covered only PDF-to-PDF merge and favorite persistence. Other conversions, workflow editor behavior, managed updates, and the proposed production static-export manifest were not tested on Mac. This is native development-server evidence, separate from the upstream production-manifest PR and its Linux results.

Catalog level: **verified**, for the recorded native route and representative PDF merge workflow. All six runtime evidence kinds are present. Selection assessment: usefulness 2/2 (combine everyday documents), local-execution value 2/2 (browser PDF processing), setup fit 2/2 (successful native import), first-use clarity 2/2 (completed merge/download), maintenance 2/2 (the tested revision includes a 2026-10-14 upstream merge). Total 10/10. Its focused PDF workspace complements OmniTools' general list/file utilities; this does not establish all advertised PDF features.

## MoChord

- Source: [Mocha-Yuan/MoChord](https://github.com/Mocha-Yuan/MoChord/tree/ce9d5240e19695f419721e391012759d0d14fe2e), MIT, version 0.2.4. Root package `mochord`; `dev` is exactly `vite`; no packageManager field. The default main branch still matched this tested commit at publication review.
- Install: canonical GitHub URL, completed through PicoRunner in 11 seconds using npm and Node 24.21.0. No repair, generated manifest or tracked source changes.
- Launch: native discovery selected the root `dev` script and PicoRunner ran `npm run dev -- --port <assigned-port>`.
- Health: the Vite development server and chord workspace were reachable on IPv6 loopback `localhost`.
- Smoke: in guest mode, entering Am produced A, C and E with intervals 1, b3 and 5. Guitar diagrams rendered with 12 voicings; saving a shape displayed confirmation that Am was saved to this browser. The notes and intervals agree with an A minor triad; the UI observations come from the runtime owner's supplied record.
- Restart: PicoRunner Stop removed the listener; Start created a new process at the same origin. Recent chord history retained Am and C.
- Cleanup: stopped through PicoRunner. The managed source and disposable browser-local chord state were retained; no uninstall or browser-state deletion is claimed.
- Limits: only local chord generation, diagrams, save confirmation and history persistence were covered. DeepSeek credentials, Supabase accounts/cloud sync, microphone permission, external AI features, audio output, tuner behavior and managed updates were not tested. The proposed production-preview manifest is separate from this native Vite development-server route.

Catalog level: **verified**, for the recorded native guest route and representative chord workflow. All six runtime evidence kinds are present. Selection assessment: usefulness 2/2 (guitar chord learning), local-execution value 2/2 (guest chord work without a service account), setup fit 2/2 (11-second native import), first-use clarity 2/2 (Am notes and diagrams), maintenance 1/2 (the reviewed commit is the current default branch, with its latest push on 2026-06-28). Total 9/10. This adds a focused music-learning activity to the collection.

## Excluded candidates

The canonical GitHub attempt did not reach launch within 5m15s and was stopped after discovery requested a manifest for multiple apps or services. A separate local-folder import of upstream main at `54a3e1122280b7792458aea60d202a99e47aba4d` passed note save/reload/restart sanity, but that is neither a successful canonical import nor verification of the develop-targeted manifest. Jotty remains outside this catalog change. Its disposable account and note were retained in the isolated test folder; no credentials or note contents are published here.

Signal is also excluded; this change supplies no complete canonical PicoRunner runtime evidence for it.

## Selection and scope

These five apps were selected under the owner's request for five suitable repositories. OmniTools is included for everyday list, image and document tasks despite also containing developer utilities; its developer-oriented tools are not the editorial focus. Dienius serves personal day planning, Web Chess serves chess practice, PDFCraft serves document tasks, and MoChord serves guitar chord learning. No logos or third-party screenshots are copied. Short README excerpts and license sources are pinned to the tested upstream commits. No deployment, merge, managed update, or unattended publisher run is part of this change.
