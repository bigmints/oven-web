import {analyticsEnabled, setAnalyticsEnabled, track, previousRating, submitRating, loadRatings, readLocal} from "./analytics-core.mjs";
const appId = document.querySelector("[data-rating-app]")?.dataset.ratingApp;
function pageEvent() {
  track("website", "page_view", {route:location.pathname});
  if (appId) track("website", "catalog_app_view", {catalog_app_id:appId});
}
const preferences = document.querySelector("[data-analytics-preferences]");
const choice = document.querySelector("[data-analytics-choice]");
choice.hidden = readLocal("picorunner.analytics.v1") !== null;
preferences.addEventListener("click", () => { choice.hidden = false; choice.querySelector("button").focus(); });
for (const button of choice.querySelectorAll("[data-analytics-allow]")) button.addEventListener("click", () => {
  const enabled = button.dataset.analyticsAllow === "yes";
  setAnalyticsEnabled(enabled); choice.hidden = true;
  if (enabled) pageEvent();
});
if (analyticsEnabled()) pageEvent();
for (const link of document.querySelectorAll("[data-install]")) link.addEventListener("click", () => {
  if (appId) track("website", "install_requested", {catalog_app_id:appId});
});
for (const form of document.querySelectorAll("[data-rating-app]")) {
  const id = form.dataset.ratingApp;
  const status = form.querySelector("[data-rating-status]");
  const submit = form.querySelector("button[type=submit]");
  const previous = previousRating(id);
  if (previous) { status.textContent = `You rated this app ${previous}/5 on this browser.`; form.querySelector("fieldset").disabled = true; submit.disabled = true; }
  form.addEventListener("submit", async event => {
    event.preventDefault();
    const value = Number(new FormData(form).get("rating"));
    submit.disabled = true; status.textContent = "Submitting…";
    try { await submitRating("website", id, value); status.textContent = `Thank you. You submitted ${value}/5. Totals update after processing.`; form.querySelector("fieldset").disabled = true; }
    catch (error) { status.textContent = error.message; submit.disabled = false; }
  });
}
const summaries = [...document.querySelectorAll("[data-rating-summary]")];
if (summaries.length) loadRatings(new URL("./ratings.json", import.meta.url).href).then(snapshot => {
  for (const node of summaries) {
    const entry = snapshot.apps[node.dataset.ratingSummary];
    node.textContent = !snapshot.updatedAt ? "Community ratings coming soon" : entry?.count ? `★ ${entry.average.toFixed(1)} / 5 · ${entry.count} ratings` : "No community ratings yet";
    if (snapshot.updatedAt) node.title = `Updated ${new Date(snapshot.updatedAt).toLocaleDateString()}. Ratings are not live.`;
  }
}).catch(() => { for (const node of summaries) node.textContent = "Community ratings unavailable"; });
