import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  validateCatalog,
  agentCommand,
  CATEGORIES,
} from "./catalog-contract.mjs";
const root = fileURLToPath(new URL("../", import.meta.url));
const catalog = JSON.parse(
  readFileSync(new URL("../catalog/apps.json", import.meta.url)),
);
test("evidence gate rejects unsupported claims and command injection", () => {
  assert.deepEqual(validateCatalog(catalog), []);
  const invalid = structuredClone(catalog);
  invalid.apps[0].compatibility.status = "verified";
  invalid.apps[0].compatibility.evidence = invalid.apps[0].compatibility.evidence.filter(
    (entry) => entry.kind !== "install",
  );
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
  const blocked = structuredClone(catalog);
  blocked.apps[0].compatibility.status = "blocked";
  blocked.apps[0].editorial.availability = "";
  assert(
    validateCatalog(blocked).some((e) => e.includes("availability explanation")),
  );
});
test("root and project Pages builds have working local links and per-app commands", () => {
  try {
    for (const base of ["/"]) {
      execFileSync(process.execPath, ["scripts/build-site.mjs"], {
        cwd: root,
        env: { ...process.env, SITE_BASE_PATH: base },
      });
      const output = JSON.parse(
        readFileSync(new URL("../site-dist/catalog.json", import.meta.url)),
      );
      assert.equal(output.apps.length, catalog.apps.length);
      assert.deepEqual(
        output.apps.map((app) => app.id),
        ["youbot", "flourish", "rise"],
      );
      assert.deepEqual(
        output.categories,
        CATEGORIES.filter((category) =>
          catalog.apps.some((app) => app.category === category),
        ),
      );
      for (const app of output.apps) {
        if (app.compatibility.status === "blocked") {
          assert.equal(app.installUrl, null);
          assert.equal(app.agentCommand, null);
        } else {
          const url = new URL(app.installUrl);
          assert.equal(url.protocol, "picorunner:");
          assert.equal(url.searchParams.get("repository"), app.repository);
          assert.equal(app.agentCommand, agentCommand(app));
        }
        const html = readFileSync(
          new URL(`../site-dist/apps/${app.id}/index.html`, import.meta.url),
          "utf8",
        );
        if (app.compatibility.status === "blocked") {
          assert(!html.includes("Copy command"));
          assert(html.includes("is not ready yet"));
          assert(!html.includes("Review the evidence"));
        } else {
          assert(html.includes("Copy command"));
        }
        assert(html.includes(app.name));
        assert(html.includes("Technical details"));
      }
      for (const page of [
        "index.html",
        "apps/index.html",
        "developers/index.html",
        "agents/index.html",
        "launch/index.html",
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
      assert(apps.includes(`${catalog.apps.length} apps`));
      assert(apps.includes("Not tested yet"));
      assert(apps.includes("Setup pending"));
      assert(!apps.includes("Excalidraw"));
      assert(!apps.includes("Actual Budget"));
      const developers = readFileSync(
        new URL("../site-dist/developers/index.html", import.meta.url),
        "utf8",
      );
      assert(developers.includes("picorunner.toml"));
      assert(developers.includes(`${base}skills/picorunner-developer/SKILL.md`));
      assert.equal(readFileSync(new URL("../site-dist/skills/picorunner-developer/SKILL.md", import.meta.url), "utf8"), readFileSync(new URL("../skills/picorunner-developer/SKILL.md", import.meta.url), "utf8"));
      assert(developers.includes("badge-generator"));
      assert(developers.includes("Read the PicoRunner developer skill"));
      assert(developers.includes("schemas/picorunner-manifest-v1.json"));
      assert(existsSync(new URL("../site-dist/badges/launch.svg", import.meta.url)));
      const schema = JSON.parse(
        readFileSync(
          new URL("../site-dist/schemas/picorunner-manifest-v1.json", import.meta.url),
          "utf8",
        ),
      );
      assert.equal(schema.properties.schema.const, 1);
      const launch = readFileSync(
        new URL("../site-dist/launch/index.html", import.meta.url),
        "utf8",
      );
      assert(launch.includes("data-launch-page"));
      assert(launch.includes("Open PicoRunner"));
      const sitemap = readFileSync(
        new URL("../site-dist/sitemap.xml", import.meta.url),
        "utf8",
      );
      assert(sitemap.includes("/apps/</loc>"));
      assert(sitemap.includes("/developers/</loc>"));
      assert(sitemap.includes("/launch/</loc>"));
      assert.equal(
        readFileSync(new URL("../site-dist/CNAME", import.meta.url), "utf8"),
        "picorunner.com\n",
      );
    }
  } finally {
    execFileSync(process.execPath, ["scripts/build-site.mjs"], {
      cwd: root,
      env: { ...process.env, SITE_BASE_PATH: "/" },
    });
  }
});
