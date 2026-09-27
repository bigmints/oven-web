import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { refreshStars } from "./refresh-stars.mjs";
import { validateCatalog } from "./catalog-contract.mjs";
const source = JSON.parse(readFileSync(new URL("../catalog/apps.json", import.meta.url)));
test("refresh saves zero and preserves snapshots on HTTP, malformed data and network failures", async () => {
  const catalog = structuredClone(source);
  catalog.apps = catalog.apps.slice(0, 3);
  for (const app of catalog.apps) Object.assign(app, { stars: 123, starsUpdatedAt: "2026-09-26T00:00:00Z" });
  let index = 0;
  const refreshed = await refreshStars(catalog, {
    now: () => "2026-09-27T00:00:00Z", warn: () => {},
    fetchRepository: async (url) => {
      assert.match(url, /^https:\/\/api.github.com\/repos\//);
      switch (index++) {
        case 0: return { ok: true, json: async () => ({ stargazers_count: 0 }) };
        case 1: return { ok: false, status: 429 };
        case 2: throw new Error("offline");
        default: throw new Error("offline");
      }
    },
  });
  assert.equal(refreshed, 1);
  assert.equal(catalog.apps[0].stars, 0);
  assert.equal(catalog.apps[0].starsUpdatedAt, "2026-09-27T00:00:00Z");
  for (const app of catalog.apps.slice(1)) {
    assert.equal(app.stars, 123);
    assert.equal(app.starsUpdatedAt, "2026-09-26T00:00:00Z");
  }
  assert.deepEqual(validateCatalog(catalog), []);
});
test("invalid repository is rejected before requests", async () => {
  const catalog = structuredClone(source);
  catalog.apps[0].repository = "https://example.com/a/b";
  await assert.rejects(refreshStars(catalog, { fetchRepository: () => assert.fail("must not fetch") }));
});
test("malformed counts and missing repositories retain old metadata", async () => {
  for (const value of [-1, 1.5, "123", null]) {
    const catalog = structuredClone(source);
    const before = structuredClone(catalog);
    assert.equal(await refreshStars(catalog, {
      warn: () => {}, fetchRepository: async () => ({ ok: true, json: async () => ({ stargazers_count: value }) }),
    }), 0);
    assert.deepEqual(catalog, before);
  }
});
