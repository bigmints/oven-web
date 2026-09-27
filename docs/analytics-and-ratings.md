# Analytics and community ratings

## Configured Google Analytics property

- Account: bigmints (249312453)
- Property: PicoRunner (556133699)
- Website stream: PicoRunner Website (15852872667)
- Measurement ID: G-2QL8FRWE3S
- Event dimensions: Catalog app (`catalog_app_id`), PicoRunner surface (`picorunner_surface`)
- Event metric: App rating (`rating_value`, Standard)
- Rating event: `rate_app`; numeric value 1–5

No database or Measurement Protocol secret is used. Collection runs in a small hosted frame at `/analytics-bridge/`. The frame validates the parent origin and source, event names, and public catalog IDs; drops all non-allowlisted parameters; and loads Google's tag only after an allowed event. Desktop has no remote scripts in its privileged renderer. Website page locations omit query strings and fragments. Ratings are explicit submissions, independent of the optional usage-analytics preference. A rating-only frame is removed after the attempt.

The desktop and website copies of `analytics-core.mjs` must stay identical. Desktop source is currently `/Users/pretheesh/Projects/oven/picorunner-release-0.3.5` (release candidate 0.3.7). Build and ship a new desktop release after the website's bridge is deployed. Release evidence is recorded separately after publication.

## Public totals without a database

`site/ratings.json` starts with `updatedAt: null`, which means collection/export has not produced a snapshot. Do not fabricate ratings or change this to zero votes. `scripts/export-ratings.mjs` rebuilds averages and counts from the GA Data API; it does not add yesterday's counts repeatedly. The existing daily Pages workflow exports before building when reporting access is configured. Failed exports preserve the last snapshot. Thresholded, sampled, truncated, or invalid reports are refused. Report counts are submission counts, not unique people.

Set these repository Actions variables after configuring Google Cloud Workload Identity Federation:

- `GA_WORKLOAD_IDENTITY_PROVIDER`: full provider resource name
- `GA_SERVICE_ACCOUNT`: dedicated ratings-reader service account email

Grant that account **Viewer on only the PicoRunner GA property**, enable Google Analytics Data API in its Cloud project, and allow federation only from the `bigmints/oven-web` repository's `main` branch (prefer immutable repository/owner IDs in the provider condition). Scope token requests to `https://www.googleapis.com/auth/analytics.readonly`. No service-account key should be downloaded or committed. These external permissions have **not** been created. The dedicated Cloud project is `bigmints-picorunner-analytics` (1075839369765). Approval for the named service account and its grants is pending.

For a one-off export, provide an authorized short-lived token as `GA_ACCESS_TOKEN` to `node scripts/export-ratings.mjs`; never put the token in a URL or commit it. Only aggregate app ID, average, count, and update time are published.

## Limits and verification

- Local storage deters repeats on one browser/installation only. Clearing it, using another device, or malicious clients can produce more votes. This is lightweight feedback, not verified one-person-one-vote.
- No edit/replacement of existing ratings is offered; GA aggregates append-only events.
- A tag callback confirms dispatch, not ingestion or inclusion in a report. Ad blockers, network failure, consent settings, and Google processing can prevent or delay reporting. Public averages refresh daily and may lag 24–48 hours.
- Preview builds deliberately do not send production events. Tests cover validation, consent, duplicate votes, spoofed acknowledgements, and preservation of previous snapshots.
- Verified locally: website checks and production build, desktop TypeScript/Vite production build, website and desktop UI in Chrome, rating-preview error states, and desktop preference default off.
- Still required: reporting identity setup, website deployment, production GA event receipt, native macOS frame/origin verification, signed desktop release, and first real ratings export. Check CORS for the deployed public `ratings.json` from the native app.
- Existing unrelated website changes and desktop home-page changes were retained. Deployment evidence will be recorded after publishing.

QA bundles built with `VITE_ANALYTICS_TEST=1` send `test_`-prefixed events with debug mode enabled. The export filters only `rate_app`, keeping native test votes out of public totals. Production builds omit this flag.
