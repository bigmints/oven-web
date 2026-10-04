# High-confidence source catalog publication

The owner explicitly requested publication of all high-confidence candidates from the 100-app source assessment. Seven initial assessments were likely-compatible; manual inspection narrowed the publication set to four consumer apps with exact supported Node package scripts and confirmed pinned licenses.

## Added

| App | Category | Source commit | Launch | License |
| --- | --- | --- | --- | --- |
| Moodist | Wellbeing | 11c0be2200116a3635880d600fd6953899cc51a3 | package.json / dev / astro dev | MIT |
| OpenResume | Productivity | 4f8255a2c763479837f69f1dccf2a3338730cd79 | package.json / dev / next dev | AGPL-3.0 |
| Dillinger | Productivity | 17010b79c18553cf9c1757c297e128f9b950c9be | package.json / dev / next dev | MIT |
| Scratch | Learning | ce118023c9b1da401ac0612ab24e743c9ab5e7a1 | package.json / start / npm --workspace @scratch/scratch-gui start | AGPL-3.0 |

All additions are source-reviewed, with check date, public pinned evidence, exact launch target, source-observed stars and ordinary-user requirements. They are not Featured or complete runtime verification claims. No candidate app was installed or executed during this publication run. PicoRunner currently installs default-branch sources; the recorded review commit does not pin installation or guarantee future revisions.

Moodist offers sound mixing, presets and timers; its README recommends Docker for deployment, while its inspected Node script provides the catalog target. Some media may need internet access. OpenResume documents a resume editor, PDF import and export without an account. Dillinger's basic writing and Markdown/HTML export are the selected workflows; cloud sync needs provider OAuth setup, and its Chromium-based PDF export remains unvalidated on macOS. Scratch's workspace exposes the visual editor; its specified Node 24.21.0, larger install and online asset/community requirements are explicit.

## Editorial judgment

Scores are ordinal review judgments, not measurements of UX or popularity. Each dimension is scored from 0 to 2.

| App | Usefulness | Local value | Setup fit | First-use clarity | Maintenance confidence | Total |
| --- | --- | --- | --- | --- | --- | --- |
| Moodist | 2: practical focus sounds | 2: personal presets | 2: inspected Astro script | 2: documented mix controls | 1: source review only | 9/10 |
| OpenResume | 2: resume creation/export | 2: personal document workflow | 2: inspected Next script | 2: documented editor and preview | 1: source review only | 9/10 |
| Dillinger | 2: writing and preview | 2: local autosave | 1: optional integrations/export limits | 2: documented editing workflow | 1: source review only | 8/10 |
| Scratch | 2: creative learning | 2: editable local projects | 1: large Node workspace | 2: visual programming interface | 2: active upstream workspace | 9/10 |

## Held outside the catalog

- StackEdit: the inspected manifest requires node-sass ^4.0.0, an obsolete native dependency. Modern bundled Node on Apple Silicon cannot be assumed compatible without a supported replacement or recipe.
- Ray Optics: setup documents npm install --no-optional; optional canvas/sharp dependencies and its special installation path need recipe review. The plain catalog URL cannot express this installation constraint.
- Piskel: the pinned start script builds the app and runs a custom server whose scripts/serve.js fixes port 9001. Runtime port selection and collision handling need a recipe review before classifying it as a reliable catalog target.

Other initial source statuses (needs-recipe, requires-setup, unsupported and unknown) were not promoted for this publication. Initial source predictions are preserved separately from the final harness checks.

## Validation and publication

- All four changed launch manifests and license identifications passed scripts/verify-source-manifests.py against pinned GitHub commits.
- Catalog schema validation passed for seven total records (three existing, four added).
- Full website suite: 17 passed, zero failed; the release build generated seven app pages.
- The website test contained a fixed list of the original three IDs. A one-line correction compares generated IDs with source catalog IDs, preserving coverage as the catalog grows. No deployment configuration, source builder, publisher policy, credentials or schedule was changed.
- Publication uses the existing owner-directed manual publisher and existing GitHub Pages workflow. Deployment success must be checked independently after the push.

Runtime evidence from earlier work was not promoted to verified status here; the general catalog explicitly permits source-reviewed predictions. A final running/cannot-run verdict is still determined at actual launch.
