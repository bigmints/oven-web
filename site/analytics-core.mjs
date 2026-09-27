// Shared website/desktop transport. Google code runs only in the hosted frame.
export const ORIGIN = "https://picorunner.com";
const preferenceKey = "picorunner.analytics.v1";
const clientKey = "picorunner.analytics.client.v1";
export function readLocal(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
export function writeLocal(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}
export function analyticsEnabled() {
  return readLocal(preferenceKey) === "yes";
}
let frame,
  ready,
  cancelLoading,
  sequence = 0;
const pending = new Map();
let testMode = false;
export function setAnalyticsTestMode(enabled) {
  testMode = enabled === true;
}
function disconnect() {
  cancelLoading?.();
  cancelLoading = undefined;
  frame?.remove();
  frame = undefined;
  ready = undefined;
  for (const entry of pending.values())
    entry.reject(new Error("Analytics disabled."));
  pending.clear();
}
export function setAnalyticsEnabled(enabled) {
  writeLocal(preferenceKey, enabled ? "yes" : "no");
  if (!enabled) disconnect();
}
function transport() {
  if (ready) return ready;
  ready = new Promise((resolve, reject) => {
    const node = document.createElement("iframe");
    frame = node;
    node.hidden = true;
    node.title = "PicoRunner analytics";
    node.referrerPolicy = "no-referrer";
    node.setAttribute("sandbox", "allow-scripts allow-same-origin");
    node.src = `${ORIGIN}/analytics-bridge/`;
    const timeout = setTimeout(() => {
      cleanup();
      node.remove();
      frame = undefined;
      ready = undefined;
      reject(new Error("Analytics is unavailable. Please try later."));
    }, 12000);
    function cleanup() {
      clearTimeout(timeout);
      cancelLoading = undefined;
      window.removeEventListener("message", loaded);
    }
    cancelLoading = () => {
      cleanup();
      reject(new Error("Analytics disabled."));
    };
    function loaded(event) {
      if (
        event.origin !== ORIGIN ||
        event.source !== node.contentWindow ||
        event.data?.type !== "pico-analytics-ready"
      )
        return;
      cleanup();
      resolve(node);
    }
    window.addEventListener("message", loaded);
    document.body.append(node);
  });
  return ready;
}
if (typeof window !== "undefined")
  window.addEventListener("message", (event) => {
    if (
      event.origin !== ORIGIN ||
      event.source !== frame?.contentWindow ||
      event.data?.type !== "pico-analytics-result"
    )
      return;
    const entry = pending.get(event.data.id);
    if (!entry) return;
    pending.delete(event.data.id);
    event.data.ok
      ? entry.resolve()
      : entry.reject(new Error("Rating could not be sent. Please try later."));
  });
export async function sendEvent(
  surface,
  name,
  params = {},
  explicitRating = false,
) {
  if (!analyticsEnabled() && !(explicitRating && name === "rate_app"))
    return false;
  // Keep preview and development activity out of production analytics.
  const production =
    surface === "website"
      ? location.origin === ORIGIN
      : [
          "tauri://localhost",
          "http://tauri.localhost",
          "https://tauri.localhost",
        ].includes(location.origin);
  if (!production) throw new Error("Analytics is disabled in this preview.");
  let client = readLocal(clientKey);
  if (!client) {
    client = crypto.randomUUID();
    writeLocal(clientKey, client);
  }
  const node = await transport();
  if (!analyticsEnabled() && !explicitRating) return false;
  return new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(new Error("Could not confirm submission. Please try later."));
    }, 10000);
    pending.set(id, {
      resolve: () => {
        clearTimeout(timer);
        resolve(true);
      },
      reject: (error) => {
        clearTimeout(timer);
        reject(error);
      },
    });
    node.contentWindow.postMessage(
      {
        type: "pico-analytics-event",
        id,
        surface,
        name,
        params,
        client,
        test: testMode,
      },
      ORIGIN,
    );
  });
}
export function track(surface, name, params = {}) {
  void sendEvent(surface, name, params).catch(() => {});
}
export function previousRating(appId) {
  const n = Number(readLocal(`picorunner.rating.v1.${appId}`));
  return Number.isInteger(n) && n >= 1 && n <= 5 ? n : null;
}
const submitting = new Set();
export async function submitRating(surface, appId, value) {
  if (
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(appId) ||
    !Number.isInteger(value) ||
    value < 1 ||
    value > 5
  )
    throw new Error("Choose a rating from 1 to 5.");
  if (previousRating(appId) || submitting.has(appId))
    throw new Error("You have already rated this app on this device.");
  submitting.add(appId);
  try {
    const sent = await sendEvent(
      surface,
      "rate_app",
      { catalog_app_id: appId, rating_value: value },
      true,
    );
    if (!sent) throw new Error("Rating was not submitted.");
    writeLocal(`picorunner.rating.v1.${appId}`, String(value));
  } finally {
    submitting.delete(appId);
    if (!analyticsEnabled() && !submitting.size) disconnect();
  }
}
export function parseRatings(data) {
  if (
    !data ||
    data.schemaVersion !== 1 ||
    !Array.isArray(data.apps) ||
    (data.updatedAt !== null &&
      (typeof data.updatedAt !== "string" ||
        !Number.isFinite(Date.parse(data.updatedAt))))
  )
    throw new Error("Invalid ratings snapshot");
  const result = {};
  for (const app of data.apps) {
    if (
      !app ||
      typeof app.id !== "string" ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(app.id) ||
      !Number.isSafeInteger(app.count) ||
      app.count < 0 ||
      (app.count > 0 &&
        (!Number.isFinite(app.average) || app.average < 1 || app.average > 5))
    )
      throw new Error("Invalid rating");
    result[app.id] = {
      average: app.count ? app.average : null,
      count: app.count,
    };
  }
  return { updatedAt: data.updatedAt, apps: result };
}
let ratingsRequest;
export function loadRatings(url = `${ORIGIN}/ratings.json`) {
  if (!ratingsRequest) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    ratingsRequest = fetch(url, {
      credentials: "omit",
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Ratings unavailable");
        return response.json();
      })
      .then(parseRatings)
      .catch((error) => {
        ratingsRequest = undefined;
        throw error;
      })
      .finally(() => clearTimeout(timeout));
  }
  return ratingsRequest;
}
