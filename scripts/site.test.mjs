import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { validateCatalog, agentCommand } from "./catalog-contract.mjs";
const root = fileURLToPath(new URL("../", import.meta.url));
const catalog = JSON.parse(
  readFileSync(new URL("../catalog/apps.json", import.meta.url)),
);
test("evidence gate rejects unsupported claims and command injection", () => {
  assert.deepEqual(validateCatalog(catalog), []);
  const invalid = structuredClone(catalog);
  invalid.apps[0].compatibility.status = "verified";
  assert(validateCatalog(invalid).some((e) => e.includes("install evidence")));
  for (const repository of [
    "https://github.com/a/b';touch /tmp/x",
    "https://github.com/a/b?run=sh",
    "https://evil.test/a/b",
    "https://github.com/a/../b",
  ]) {
    assert.throws(() => agentCommand({ ...catalog.apps[0], repository }));
  }
  invalid.apps[0] = structuredClone(invalid.apps[1]);
  assert(validateCatalog(invalid).some((e) => e.includes("duplicate")));
});
test("root and project Pages builds have working local links and per-app commands", () => {
  try {
    for (const base of ["/", "/oven-web/"]) {
      execFileSync(process.execPath, ["scripts/build-site.mjs"], {
        cwd: root,
        env: { ...process.env, SITE_BASE_PATH: base },
      });
      const output = JSON.parse(
        readFileSync(new URL("../site-dist/catalog.json", import.meta.url)),
      );
      assert.equal(output.apps.length, catalog.apps.length);
      for (const app of output.apps) {
        const url = new URL(app.installUrl);
        assert.equal(url.protocol, "oven:");
        assert.equal(url.searchParams.get("repository"), app.repository);
        assert.equal(app.agentCommand, agentCommand(app));
        const html = readFileSync(
          new URL(`../site-dist/apps/${app.id}/index.html`, import.meta.url),
          "utf8",
        );
        assert(html.includes("Copy command"));
        assert(html.includes(app.name));
      }
      for (const page of [
        "index.html",
        "apps/index.html",
        "agents/index.html",
        "download/index.html",
        ...catalog.apps.map((a) => `apps/${a.id}/index.html`),
      ]) {
        const html = readFileSync(
          new URL(`../site-dist/${page}`, import.meta.url),
          "utf8",
        );
        for (const [, link] of html.matchAll(/(?:href|src)="([^"#]+)"/g)) {
          if (!link.startsWith("/")) continue;
          assert(link.startsWith(base), `wrong base: ${link}`);
          const relative = link.slice(base.length).split("#")[0];
          assert(
            existsSync(
              new URL(
                `../site-dist/${relative}${relative.endsWith("/") || !relative ? "index.html" : ""}`,
                import.meta.url,
              ),
            ),
            `broken local link: ${link}`,
          );
        }
      }
      const home = readFileSync(
        new URL("../site-dist/index.html", import.meta.url),
        "utf8",
      );
      const apps = readFileSync(
        new URL("../site-dist/apps/index.html", import.meta.url),
        "utf8",
      );
      assert(home.includes(`href="${base}apps/"`));
      assert(!home.includes("id=\"search\""));
      assert(apps.includes("id=\"search\""));
      assert(apps.includes(`${catalog.apps.length} apps to explore`));
      const sitemap = readFileSync(
        new URL("../site-dist/sitemap.xml", import.meta.url),
        "utf8",
      );
      assert(sitemap.includes("/apps/</loc>"));
    }
  } finally {
    execFileSync(process.execPath, ["scripts/build-site.mjs"], {
      cwd: root,
      env: { ...process.env, SITE_BASE_PATH: "/" },
    });
  }
});
