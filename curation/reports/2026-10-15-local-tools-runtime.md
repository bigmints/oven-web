# Three local apps: source and Mac sanity checks

Recorded on 2026-10-15. Test host: macOS 26.6.2 (25G83), Apple Silicon arm64; PicoRunner 0.3.14. These are canonical GitHub imports through PicoRunner native discovery, not tests of the proposed upstream production manifests. Each selected the root package and its existing `dev` script (`vite`). Browser storage belongs to the browser profile and origin. The installed desktop fetches the current default branch, so a later installation can differ from the tested revision.

The supplied Mac evidence archive was 85,175 bytes, SHA-256 `bb8edbb074857129de8fe85bb48c93cd2bd83bc4f1f145bb10de87a33217bd1f`. All 17 included file hashes passed. Export bytes were inspected independently. This report omits local paths, registration identifiers, process IDs, raw registries, and browser backup contents. The before/after comparison reported all 15 pre-existing apps unchanged.

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
- Install: canonical GitHub URL, completed through PicoRunner in 34 seconds on attempt zero using npm. Tracked source files remained unchanged.
- Launch and health: PicoRunner native discovery ran `npm run dev -- --port <assigned-port>`; the UI and local engine were ready on IPv6 loopback `localhost`.
- Smoke: the human move e4 received local Stockfish e5. Exported PGN independently contains `1. e4 e5 *`; the two-ply game was saved to the library. Export SHA-256 `737f8185246de8c81417e8e72deefe5045f1285e99c1c1e9fcec3bed236484fd`.
- Cleanup: the app was stopped and its listener disappeared. Its managed folder and registration were retained.
- Missing: restart persistence was not tested. Native UI work was paused while the owner used PicoRunner. Managed updates were reported outside PicoRunner, and the proposed production-preview manifest was not tested on Mac.

Catalog level: **source-reviewed**, with successful Mac install/launch/sanity evidence. The catalog's current verified contract requires restart evidence, which is absent; no placeholder restart assertion is added.

## Selection and scope

The owner requested these three apps. OmniTools is included for everyday list, image and document tasks despite also containing developer utilities; its developer-oriented tools are not the editorial focus. Dienius serves personal day planning, and Web Chess serves chess practice. No logos or third-party screenshots are copied. Short README excerpts and license sources are pinned to the tested upstream commits. No deployment, merge, managed update, or unattended publisher run is part of this change.
