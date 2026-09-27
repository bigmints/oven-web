import {validateEvent} from "./analytics-validation.mjs";
const config = JSON.parse(document.querySelector("#analytics-config").textContent);
let loading;
function loadTag() {
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() { window.dataLayer.push(arguments); };
    window.gtag("consent", "default", {analytics_storage:"granted", ad_storage:"denied", ad_user_data:"denied", ad_personalization:"denied"});
    window.gtag("js", new Date());
    const script = document.createElement("script");
    script.src = `https://www.googletagmanager.com/gtag/js?id=${config.measurementId}`;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => { loading = undefined; script.remove(); reject(new Error("Tag unavailable")); };
    document.head.append(script);
  });
  return loading;
}
window.addEventListener("message", async event => {
  if (event.source !== parent) return;
  const valid = validateEvent(event.data, event.origin, config.appIds);
  if (!valid) return;
  const reply = ok => {
    const send = () => event.source.postMessage({type:"pico-analytics-result", id:event.data.id, ok,
      ...(event.data.test === true ? {diagnostics:{cookieAvailable: /(?:^|; )_ga=/.test(document.cookie), collectRequests:performance.getEntriesByType("resource").filter(item => {try {const url = new URL(item.name); return url.hostname.endsWith("google-analytics.com") && url.pathname.includes("collect");} catch {return false;}}).length}} : {})
    }, event.origin);
    if (event.data.test === true) setTimeout(send,2000); else send();
  };
  try {
    if (valid.params.picorunner_surface === "desktop") {
      if (!config.collectorUrl) throw new Error("Native collector unavailable");
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(),10000);
      try {
        const response = await fetch(config.collectorUrl, {
          method:"POST", headers:{"Content-Type":"application/json"}, credentials:"omit",
          body:JSON.stringify({type:"pico-analytics-event",id:event.data.id,client:valid.client,surface:"desktop",name:event.data.name,params:valid.params,test:event.data.test === true}), signal:controller.signal,
        });
        if (!response.ok || (await response.json()).accepted !== true) throw new Error("Collection failed");
      } finally {clearTimeout(timeout);}
      reply(true);
      return;
    }
    await loadTag();
    window.gtag("config", config.measurementId, {send_page_view:false, client_id:valid.client, cookie_flags:"SameSite=None;Secure", cookie_update:false, page_location:"https://picorunner.com/", page_referrer:"", allow_google_signals:false, allow_ad_personalization_signals:false});
    window.gtag("event", valid.name, {...valid.params, send_to:config.measurementId, event_callback:() => reply(true)});
  } catch { reply(false); }
});
// No data is sent until the parent submits an explicitly allowed event.
parent.postMessage({type:"pico-analytics-ready"}, "*");
