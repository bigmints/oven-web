import {readFile, writeFile, rename} from "node:fs/promises";
import {fileURLToPath} from "node:url";
import {parseRatings} from "../site/analytics-core.mjs";
export function ratingsFromReport(report, ids, updatedAt = new Date().toISOString()) {
  if (report.metadata?.subjectToThresholding || report.metadata?.dataLossFromOtherRow || report.metadata?.samplingMetadatas?.length) throw new Error("Incomplete GA report; preserving previous ratings.");
  if ((report.rowCount || 0) > (report.rows || []).length) throw new Error("Truncated report");
  const apps = ids.map(id => ({id, average:null, count:0}));
  const seen = new Set();
  for (const row of report.rows || []) {
    const id = row.dimensionValues?.[0]?.value;
    const app = apps.find(app => app.id === id);
    if (!app) continue;
    if (seen.has(id)) throw new Error("Duplicate app row");
    seen.add(id);
    app.average = Number(row.metricValues?.[0]?.value);
    app.count = Number(row.metricValues?.[1]?.value);
  }
  const snapshot = {schemaVersion:1, updatedAt, apps};
  parseRatings(snapshot);
  return snapshot;
}
export async function exportRatings(token, request = fetch) {
  if (!token) throw new Error("GA_ACCESS_TOKEN is required. Configure read-only Google Analytics access in GitHub Actions.");
  const catalog = JSON.parse(await readFile(new URL("../catalog/apps.json", import.meta.url)));
  const response = await request("https://analyticsdata.googleapis.com/v1beta/properties/556133699:runReport", {
    method:"POST", headers:{Authorization:`Bearer ${token}`, "Content-Type":"application/json"}, signal:AbortSignal.timeout(30000),
    body:JSON.stringify({
      dateRanges:[{startDate:"2026-09-27", endDate:"today"}],
      dimensions:[{name:"customEvent:catalog_app_id"}],
      metrics:[{name:"averageCustomEvent:rating_value"},{name:"countCustomEvent:rating_value"}],
      dimensionFilter:{filter:{fieldName:"eventName",stringFilter:{matchType:"EXACT",value:"rate_app"}}},
      limit:10000,
    }),
  });
  if (!response.ok) throw new Error(`GA report failed (${response.status}); previous snapshot preserved.`);
  const snapshot = ratingsFromReport(await response.json(), catalog.apps.map(app => app.id));
  const destination = new URL("../site/ratings.json", import.meta.url);
  const temporary = new URL("../site/ratings.json.tmp", import.meta.url);
  await writeFile(temporary, JSON.stringify(snapshot,null,2)+"\n");
  await rename(temporary, destination);
  return snapshot;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await exportRatings(process.env.GA_ACCESS_TOKEN);
  console.log("Published aggregate app ratings snapshot.");
}
