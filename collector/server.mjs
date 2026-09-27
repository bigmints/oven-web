import { createServer } from "node:http";
import { pathToFileURL } from "node:url";
import { validateEvent } from "../site/analytics-validation.mjs";
import { readFile } from "node:fs/promises";

const catalog = JSON.parse(await readFile(new URL("../catalog/apps.json", import.meta.url)));
const appIds = catalog.apps.map(app => app.id);
const website = "https://picorunner.com";
const sessions = new Map();
const budget = new Map();
const maxEntries = 10000;
function boundedSet(map, key, value) {
  if (!map.has(key) && map.size >= maxEntries) map.delete(map.keys().next().value);
  map.set(key, value);
}

export function createHandler({apiSecret, measurementId = "G-2QL8FRWE3S", request = fetch, now = Date.now} = {}) {
  return async (req, res) => {
    const headers = {"Content-Type":"application/json", "Cache-Control":"no-store", "Vary":"Origin"};
    if (req.headers.origin === website) Object.assign(headers, {
      "Access-Control-Allow-Origin":website,
      "Access-Control-Allow-Methods":"POST, OPTIONS",
      "Access-Control-Allow-Headers":"Content-Type",
    });
    const reply = (status, body) => { res.writeHead(status, headers); res.end(JSON.stringify(body)); };
    if (req.url === "/health" && req.method === "GET") return reply(200, {ok:true});
    if (req.url !== "/events") return reply(404, {error:"Not found"});
    if (req.headers.origin !== website) return reply(403, {error:"Origin not allowed"});
    if (req.method === "OPTIONS") {res.writeHead(204, headers); res.end(); return;}
    if (req.method !== "POST") return reply(405, {error:"Method not allowed"});
    if (!apiSecret) return reply(503, {error:"Collection unavailable"});
    if (!req.headers["content-type"]?.startsWith("application/json")) return reply(415, {error:"JSON required"});
    try {
      let raw = "";
      for await (const chunk of req) {
        raw += chunk;
        if (Buffer.byteLength(raw) > 4096) return reply(413, {error:"Request too large"});
      }
      let data;
      try {data = JSON.parse(raw);} catch {return reply(400, {error:"Invalid JSON"});}
      // This public endpoint receives only the desktop surface through the hosted bridge.
      if (data?.surface !== "desktop") return reply(400, {error:"Invalid surface"});
      const event = validateEvent(data, "tauri://localhost", appIds);
      if (!event) return reply(400, {error:"Invalid event"});
      const time = now();
      const window = budget.get(event.client);
      if (window && time - window.start < 60000 && window.count >= 10) return reply(429, {error:"Please try later"});
      boundedSet(budget, event.client, window && time - window.start < 60000 ? {...window,count:window.count+1} : {start:time,count:1});
      let session = sessions.get(event.client);
      if (!session || time - session.last > 30 * 60000) session = {id:Math.floor(time/1000),last:time};
      session.last = time;
      boundedSet(sessions,event.client,session);
      const payload = {client_id:event.client, consent:{ad_user_data:"DENIED",ad_personalization:"DENIED"},
        events:[{name:event.name,params:{...event.params,session_id:session.id,engagement_time_msec:1}}]};
      const url = new URL("https://www.google-analytics.com/mp/collect");
      url.searchParams.set("measurement_id",measurementId);
      url.searchParams.set("api_secret",apiSecret);
      const options = {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload),signal:AbortSignal.timeout(8000)};
      // Validate QA events before sending; validation requests alone never record events.
      if (data.test === true) {
        const validationUrl = new URL(url); validationUrl.pathname = "/debug/mp/collect";
        const validation = await request(validationUrl, {...options,body:JSON.stringify({...payload,validation_behavior:"ENFORCE_RECOMMENDATIONS"})});
        if (!validation.ok || (await validation.json()).validationMessages?.length) return reply(502,{error:"Event validation failed"});
      }
      const response = await request(url, options);
      if (!response.ok) return reply(502, {error:"Google collection unavailable"});
      // HTTP acceptance still does not guarantee eventual inclusion in Google's reports.
      return reply(202, {accepted:true});
    } catch {
      return reply(502, {error:"Collection unavailable"});
    }
  };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  createServer(createHandler({apiSecret:process.env.GA_API_SECRET})).listen(Number(process.env.PORT || 8080),"0.0.0.0");
}
