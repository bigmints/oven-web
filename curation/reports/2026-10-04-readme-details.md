# README-based app details

The owner requested clearer README excerpts, visible license and legal information, and GitHub star buttons, using Moodist's page as the example. This update applies to all seven current catalog entries.

- Selected paragraphs and feature lists were checked against each app's pinned README after removing Markdown formatting and normalizing whitespace. Build-time rendering uses bounded, escaped plain text, not upstream HTML.
- Every details page labels the excerpt, links to the full pinned README, and shows the license near the app introduction. A separate visible legal section includes license-file links, available project copyright notices, and source-grounded legal notes.
- Six pinned license files were confirmed: Flourish, Rise, Moodist and Dillinger are MIT; OpenResume and Scratch are AGPL-3.0. The pinned Youbot license endpoint returns 404, so its license remains unconfirmed despite the README's MIT badge.
- Moodist's MIT code license is distinguished from the Pixabay Content License and CC0 terms documented for some sounds. Rise's source disclaimer about record keeping and medical care is retained. AGPL license-template copyright was not attributed to project authors.
- View on GitHub and Star on GitHub actions appear beside the description. The star action opens GitHub and makes no claim that PicoRunner can submit a star. Existing popularity counts remain visible.
- Compatibility status, runtime evidence, install links, analytics behavior and download configuration remain as previously published. No app installation is part of this website update.

Validation: seven excerpt checks, six pinned license checks, 19 website tests, release build, diff check, and visual inspection of Moodist. Tests cover visible legal sections, all seven excerpts/actions, escaped upstream text, malformed or off-project source links, and unsafe asset-license URLs.

Publication is a scoped website commit through the existing GitHub Pages workflow. Deployment and live content are checked after pushing; a push alone is not proof that the site updated.
