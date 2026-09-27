import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {validateEvent} from "../site/analytics-validation.mjs";
import {parseRatings, previousRating, submitRating, setAnalyticsEnabled, analyticsEnabled, sendEvent} from "../site/analytics-core.mjs";
import {ratingsFromReport, exportRatings} from "./export-ratings.mjs";
const client = "11111111-1111-4111-8111-111111111111";
const event = {type:"pico-analytics-event",id:1,client,surface:"desktop",name:"rate_app",params:{catalog_app_id:"rise",rating_value:5,secret:"never-forward"}};
test("bridge accepts only trusted surfaces, allowed events and bounded catalog ratings", () => {
  assert.deepEqual(validateEvent(event,"tauri://localhost",["rise"]),{name:"rate_app",client,params:{picorunner_surface:"desktop",catalog_app_id:"rise",rating_value:5}});
  for (const origin of ["null","https://evil.test","http://localhost:1420"]) assert.equal(validateEvent(event,origin,["rise"]),null);
  assert.equal(validateEvent({...event,surface:"website"},"tauri://localhost",["rise"]),null);
  assert.equal(validateEvent(event,"tauri://localhost",["flourish"]),null);
  for (const rating_value of [0,6,1.5,"5",null]) assert.equal(validateEvent({...event,params:{catalog_app_id:"rise",rating_value}},"tauri://localhost",["rise"]),null);
  assert.equal(validateEvent({...event,name:"private_path"},"tauri://localhost",["rise"]),null);
});
test("page events do not accept URLs, query strings, or arbitrary paths", () => {
  const page = {...event,surface:"website",name:"page_view",params:{route:"/apps/rise/",private_path:"/Users/example"}};
  assert.deepEqual(validateEvent(page,"https://picorunner.com",["rise"]).params,{picorunner_surface:"website",page_location:"https://picorunner.com/apps/rise/",page_title:"/apps/rise/"});
  for (const route of ["/launch/?repository=secret","https://evil.test","/Users/example","/apps/rise/?q=health"]) assert.equal(validateEvent({...page,params:{route}},"https://picorunner.com",["rise"]),null);
});
test("GA aggregate report validates averages and refuses incomplete data", () => {
  const report = {rows:[{dimensionValues:[{value:"rise"}],metricValues:[{value:"4.5"},{value:"2"}]}],rowCount:1};
  const data = ratingsFromReport(report,["rise","flourish"],"2026-09-27T12:00:00Z");
  assert.equal(parseRatings(data).apps.rise.average,4.5);
  assert.equal(parseRatings(data).apps.flourish.count,0);
  assert.throws(() => ratingsFromReport({...report,metadata:{subjectToThresholding:true}},["rise"]));
  assert.throws(() => ratingsFromReport({...report,rowCount:2},["rise"]));
  assert.throws(() => ratingsFromReport({...report,rows:[report.rows[0],report.rows[0]]},["rise"]));
  for (const average of [0,6,NaN]) assert.throws(() => parseRatings({schemaVersion:1,updatedAt:null,apps:[{id:"rise",average,count:1}]}));
});
test("failed GA export preserves previous published snapshot", async () => {
  const file = new URL("../site/ratings.json",import.meta.url);
  const before = readFileSync(file,"utf8");
  await assert.rejects(exportRatings("test",async()=>({ok:false,status:403})),/403/);
  assert.equal(readFileSync(file,"utf8"),before);
});
test("analytics defaults off and invalid or duplicate votes never send", async () => {
  const values = new Map();
  globalThis.localStorage = {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
  assert.equal(analyticsEnabled(),false);
  assert.equal(await sendEvent("desktop","app_open"),false);
  setAnalyticsEnabled(true); assert.equal(analyticsEnabled(),true);
  setAnalyticsEnabled(false); assert.equal(analyticsEnabled(),false);
  assert.equal(previousRating("rise"),null);
  await assert.rejects(submitRating("desktop","rise",6),/1 to 5/);
  values.set("picorunner.rating.v1.rise","4");
  assert.equal(previousRating("rise"),4);
  await assert.rejects(submitRating("desktop","rise",5),/already rated/);
});
test("transport validates reply origin/source and stores a vote only after acknowledgement", async () => {
  const listeners = new Set();
  const values = new Map();
  globalThis.localStorage = {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
  globalThis.location = {origin:"https://picorunner.com"};
  globalThis.window = {addEventListener:(_type,fn)=>listeners.add(fn), removeEventListener:(_type,fn)=>listeners.delete(fn)};
  let outgoing, removed = false;
  const contentWindow = {postMessage:message => {outgoing = message;}};
  const fire = event => {for (const fn of [...listeners]) fn(event);};
  globalThis.document = {createElement:()=>({contentWindow,setAttribute(){},remove(){removed = true;}}),body:{append(){queueMicrotask(()=>fire({origin:"https://picorunner.com",source:contentWindow,data:{type:"pico-analytics-ready"}}));}}};
  const transport = await import("../site/analytics-core.mjs?transport-test");
  const submission = transport.submitRating("website","rise",4);
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(outgoing.name,"rate_app");
  assert.equal(transport.previousRating("rise"),null);
  fire({origin:"https://evil.test",source:contentWindow,data:{type:"pico-analytics-result",id:outgoing.id,ok:true}});
  fire({origin:"https://picorunner.com",source:{},data:{type:"pico-analytics-result",id:outgoing.id,ok:true}});
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(transport.previousRating("rise"),null);
  fire({origin:"https://picorunner.com",source:contentWindow,data:{type:"pico-analytics-result",id:outgoing.id,ok:true}});
  await submission;
  assert.equal(transport.previousRating("rise"),4);
  assert.equal(removed,true,"rating-only frame is removed after submission");
});

test("QA ratings use a separate event name excluded from public rating reports", () => {
  const validated = validateEvent({...event,test:true}, "tauri://localhost", ["rise"]);
  assert.equal(validated.name,"test_rate_app");
  assert.equal(validated.params.debug_mode,true);
  assert.equal(validateEvent({...event,test:"true"}, "tauri://localhost", ["rise"]).name,"rate_app");
});
