# Database-free native analytics collector

The native WebKit iframe cannot create analytics cookies. Native QA confirmed zero Google collect requests despite gtag callbacks. The hosted bridge therefore needs this stateless relay for desktop events; the website continues using Google's browser tag.

The runtime forwards only validated public catalog IDs, bounded ratings, event names, an anonymous client UUID, and session/engagement fields to GA4 Measurement Protocol. It stores no database or files and logs neither request bodies nor Google URLs. Per-client in-memory throttling is bounded and best-effort, not durable anti-fraud protection. Instances are disposable. Normal cloud access logs may contain network metadata; do not enable request-body logging.

Deploy the container in project `bigmints-picorunner-analytics`, service `picorunner-analytics`, region `europe-west1`, minimum instances 0, maximum instances 1, 256 MiB RAM and 1 CPU. Keep `GA_API_SECRET` in Secret Manager. Use a dedicated `analytics-collector` runtime service account with access only to this one secret; grant it no GA reporting or project-wide roles. The public `/events` route is intentionally unauthenticated and validates every event. CORS allows only https://picorunner.com; CORS is not authentication. The client never receives the API secret.

Requires action-time approval for the persistent runtime identity, its secret access, public collector, and creation of the GA Measurement Protocol credential. A billing account may be required by Cloud Run even with zero minimum instances; do not attach billing without the user's explicit approved account and spending constraints.

Once deployed, set `googleAnalyticsCollectorUrl` in `site/config.json` to the service origin + `/events`, rebuild/publish the website, and prove a `test_rate_app` from the native QA bundle in GA DebugView. A Measurement Protocol 2xx response only confirms request receipt. Do not publish the desktop release until actual native ingestion is verified.

Google documentation: https://developers.google.com/analytics/devguides/collection/protocol/ga4/sending-events and https://developers.google.com/analytics/devguides/collection/protocol/ga4/validating-events .
