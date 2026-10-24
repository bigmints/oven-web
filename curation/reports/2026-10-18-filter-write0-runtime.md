# Filter and write0: limited PicoRunner runtime verification

Validation date: 2026-10-18. Publication review: 2026-10-19. The runtime lane used PicoRunner 0.3.14 on macOS 26.6.2, Apple Silicon arm64; these platform/version values come from its recorded readiness context. Publication reviewed the completed per-app validation, source, installer and launch snapshots, and synthetic exports. No publication-side PicoRunner UI actions were taken.

These observations cover the listed primary tasks through canonical repository import and native script discovery. They do not establish every feature, managed updates, or desktop acceptance of the separately proposed production manifests. PicoRunner currently imports the latest default branch, not the recorded verification commit; later upstream changes may behave differently.

## Filter

Repository: https://github.com/addyosmani/filter

Tested commit: `fc7acbb2b6373b0a437776284c72524f83819210`.

- **Install:** canonical import completed at attempt zero. The saved installer job reports complete and says launch checks passed. Root package is `vite-react-typescript-starter`, with `dev: vite`; packageManager is absent. The runtime package bytes match the pinned source reviewed for publication.
- **Launch:** native discovery ran `npm run dev -- --port <assigned-port>`. The observed listener was IPv6 wildcard, so the canonical development route listens on all interfaces, not only loopback. Treat it as potentially reachable from the local network subject to OS/network rules. The initial leftover process executable was verified as bundled Node 24.
- **Health:** installer launch checks completed, and the application was reachable in the browser for image editing and subsequent reload. The report does not assert an independently captured numeric HTTP status for this native run.
- **Smoke:** imported a synthetic 320×200 PNG; Flip X changed to Un-Flip X and enabled Undo. Save produced the edited preview, and Download Image produced a 320×200 PNG of 3,366 bytes. Export SHA-256: `1cf91043fb84d136cd6ad53e71c5a0cc19d22cf9c5e1982850b70a73a7132694`.
- **Restart:** native Stop removed the later test listener, Start succeeded, and browser reload returned the Select Image landing page. Editing state is in memory and did not persist; the downloaded image remained. PicoRunner changed its assigned port during the session.
- **Cleanup:** an initial leftover test process survived native Stop after an earlier transport interruption. The runtime lane verified its test workspace and executable, sent SIGTERM to that process, and confirmed its listener absent. Subsequent native stops cleared the later listener normally. Final native Stop showed the app stopped and its listener was absent. No uninstall or deletion of the managed source or downloaded export is claimed.

A UI upload helper stalled during the interrupted session; this is not represented as application launch time. Verification is limited to the completed synthetic import/flip/save/download task and restart behavior. No broader editing-format or privacy guarantee is made. The upstream integration draft uses an explicitly loopback-bound production preview, but that proposed route is separate from the canonical native route tested here.

## write0

Repository: https://github.com/omarbdri/write0

Tested commit: `f21a90d01fc831e28d47e591afce93d78a51032e`. The runtime source snapshot records the actual checkout equal to this expected commit.

- **Install:** canonical import completed at attempt zero in 19 seconds. The saved installer job reports complete with launch checks passed. Root package is `write0`, with `dev: vite`; packageManager is absent. Runtime package and license bytes match the pinned source reviewed for publication.
- **Launch:** native discovery ran `npm run dev -- --port <assigned-port>`. The listener was IPv6 loopback (`::1`).
- **Health:** installer readiness completed, and the browser rendered the editor and Markdown preview; both were usable again after native restart and reload. No independent numeric HTTP status is asserted for this native run.
- **Smoke:** created a synthetic 17-word note. Markdown preview rendered a heading and two bullets correctly. Markdown export produced 101 bytes and matched the expected synthetic text. Export SHA-256: `5104e8a683a02d4d46dd8a3d5430483787e7ecfd7b843f8f16e498568303527d`.
- **Restart:** native Stop removed the listener; Start and browser reload retained the active note, its text and the preview in the same browser context.
- **Cleanup:** final native Stop was confirmed and its listener was absent. Browser-local synthetic notes and the export were retained; no uninstall or data deletion is claimed.

write0 loads Tailwind CDN JavaScript and Google Fonts. Local hosting does not imply offline styling or zero network traffic. Documents and preferences use browser localStorage outside the managed checkout; keep the same browser profile and local origin. PDF export invokes browser printing and was not tested. The proposed production manifest and managed updates remain outside this native verification.

## Publication scope

Only these two apps are included in this partial catalog change. Pic Smaller lacks a completed runtime report; Super Sudoku and Solitaire lack canonical runtime verification. Their local build/tests or draft PRs do not substitute for runtime evidence. No logos, screenshots, raw registry records, local workspace paths, process identifiers, credentials, or unrelated app inventory are published here.
