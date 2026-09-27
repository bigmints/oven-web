export function validateEvent(data, origin, ids) {
  if (!data || data.type !== "pico-analytics-event" || !Number.isSafeInteger(data.id) || !/^[a-f0-9-]{36}$/i.test(data.client || "")) return null;
  const surface = origin === "https://picorunner.com" ? "website" : ["tauri://localhost", "http://tauri.localhost", "https://tauri.localhost"].includes(origin) ? "desktop" : null;
  if (!surface || data.surface !== surface) return null;
  if (!["page_view", "app_open", "catalog_app_view", "install_requested", "install_completed", "app_launch", "rate_app"].includes(data.name)) return null;
  const params = {picorunner_surface:surface};
  const input = data.params || {};
  if (["catalog_app_view", "install_requested", "install_completed", "app_launch", "rate_app"].includes(data.name)) {
    if (!ids.includes(input.catalog_app_id)) return null;
    params.catalog_app_id = input.catalog_app_id;
  }
  if (data.name === "rate_app") {
    if (!Number.isInteger(input.rating_value) || input.rating_value < 1 || input.rating_value > 5) return null;
    params.rating_value = input.rating_value;
  }
  // Never forward full URLs, search queries, repository paths, or arbitrary payloads.
  if (data.name === "page_view") {
    if (typeof input.route !== "string" || !/^\/(?:apps\/(?:[a-z0-9-]+\/)?|developers\/|agents\/|privacy\/|download\/|launch\/)?$/.test(input.route)) return null;
    params.page_location = `https://picorunner.com${input.route}`;
    params.page_title = input.route;
  }
  if (data.test === true) params.debug_mode = true;
  return {name:data.test === true ? `test_${data.name}` : data.name, params, client:data.client};
}
