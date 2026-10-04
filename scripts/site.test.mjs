import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { readmeSection, legalSection, projectActions } from "./app-details.mjs";
import {
  validateCatalog,
  agentCommand,
  CATEGORIES,
} from "./catalog-contract.mjs";
const root = fileURLToPath(new URL("../", import.meta.url));
const catalog = JSON.parse(
  readFileSync(new URL("../catalog/apps.json", import.meta.url)),
);
test("README and legal sections escape upstream text and reject unsafe source links", () => {
  const app = structuredClone(catalog.apps.find(app => app.id === "moodist"));
  app.readme.paragraphs = ['<script>alert("README")</script>'];
  app.editorial.legalNotes = ['<img src=x onerror=alert(1)>'];
  assert(readmeSection(app).includes('&lt;script&gt;'));
  assert(!readmeSection(app).includes('<script>'));
  assert(!legalSection(app).includes('<img'));
  assert(projectActions(app).includes('Star on GitHub'));
  for (const source of ['javascript:alert(1)', 'https://evil.test/README.md', `${app.repository}/blob/${app.compatibility.commit}/../README.md`, `${app.repository}/blob/${app.compatibility.commit}/%ZZ`]) {
    app.readme.source = source;
    assert(validateCatalog({schemaVersion: 1, apps: [app]}).some(error => error.includes('README excerpts')));
  }
  app.readme = structuredClone(catalog.apps.find(app => app.id === "moodist").readme);
  app.editorial.assetLicenses[0].source = 'javascript:alert(1)';
  assert(validateCatalog({schemaVersion: 1, apps: [app]}).some(error => error.includes('asset licenses')));
});
test("all app details expose README excerpts, legal information and GitHub actions", () => {
  execFileSync(process.execPath, ["scripts/build-site.mjs"], {cwd: root});
  for (const app of catalog.apps) {
    const html = readFileSync(new URL(`../site-dist/apps/${app.id}/index.html`, import.meta.url), "utf8");
    assert(app.readme.paragraphs.length);
    assert(html.includes(readmeSection(app)));
    assert(html.includes(legalSection(app)));
    assert(html.includes(projectActions(app)));
    assert(html.indexOf('License and legal') < html.indexOf('<details class="technical-details">'));
    assert(html.includes('rel="noopener noreferrer"'));
  }
  const moodist = readFileSync(new URL('../site-dist/apps/moodist/index.html', import.meta.url), 'utf8');
  assert(moodist.includes('Pixabay Content License'));
  assert(moodist.includes('Creative Commons Zero (CC0)'));
  const youbot = readFileSync(new URL('../site-dist/apps/youbot/index.html', import.meta.url), 'utf8');
  assert(youbot.includes('License not confirmed'));
});
test("catalog surfaces do not substitute invented icons for official app logos", () => {
  execFileSync(process.execPath, ["scripts/build-site.mjs"], {cwd: root});
  for (const page of ["index.html", "apps/index.html", ...catalog.apps.map(app => `apps/${app.id}/index.html`)]) {
    const html = readFileSync(new URL(`../site-dist/${page}`, import.meta.url), "utf8");
    assert(!html.includes('class="app-icon'), `unofficial app icon on ${page}`);
    assert(!html.includes('app-icon-'), `invented app branding on ${page}`);
  }
});
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
        catalog.apps.map((app) => app.id),
      );
      assert.deepEqual(
        output.categories,
        CATEGORIES.filter((category) =>
          catalog.apps.some((app) => app.category === category),
        ),
      );
      const listing = readFileSync(new URL("../site-dist/apps/index.html", import.meta.url), "utf8");
      for (const app of output.apps) {
        const original = catalog.apps.find((entry) => entry.id === app.id);
        assert.equal(app.stars, original.stars);
        if (app.stars !== undefined) {
          assert(listing.includes(`${app.name}: ${app.stars.toLocaleString("en")} GitHub stars`));
          assert(listing.includes(`href="${app.repository}" aria-label=`));
        }
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
        assert(html.includes("is not in PicoRunner yet"));
          assert(!html.includes("Review the evidence"));
        } else {
        assert(!html.includes("Copy command"));
        }
        assert(html.includes(app.name));
      assert(html.includes("For developers"));
      }
      let sharedHeader;
      for (const page of [
        "index.html",
        "apps/index.html",
        "developers/index.html",
        "launch/index.html",
        "download/index.html",
        "privacy/index.html",
        "404.html",
        ...catalog.apps.map((a) => `apps/${a.id}/index.html`),
      ]) {
        const html = readFileSync(
          new URL(`../site-dist/${page}`, import.meta.url),
          "utf8",
        );
        const header = html.match(/<header class="header">[\s\S]*?<\/header>/)?.[0];
        assert(header, `missing header: ${page}`);
        const normalizedHeader = header.replace(/ aria-current="(?:page|location)"/g, "");
        sharedHeader ??= normalizedHeader;
        assert.equal(normalizedHeader, sharedHeader, `inconsistent navigation: ${page}`);
        if (page.startsWith("apps/")) {
          assert(header.includes(`href="${base}apps/" aria-current="${page === "apps/index.html" ? "page" : "location"}"`));
        }
        for (const asset of ["styles.css", "tokens.css", "app.js"]) {
          assert(html.includes(`${base}${asset}?v=`), `unversioned shared asset: ${page}`);
        }
        for (const [, link] of html.matchAll(/(?:href|src)="([^"#]+)"/g)) {
          if (!link.startsWith("/")) continue;
          assert(link.startsWith(base), `wrong base: ${link}`);
          const relative = link.slice(base.length).split(/[?#]/)[0];
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
      const developerSkill = readFileSync(
        new URL("../site-dist/skills/picorunner-developer/SKILL.md", import.meta.url),
        "utf8",
      );
      const developerPage = readFileSync(
        new URL("../site-dist/developers/index.html", import.meta.url),
        "utf8",
      );
      assert.equal(
        developerSkill,
        readFileSync(new URL("../skills/picorunner-developer/SKILL.md", import.meta.url), "utf8"),
      );
      assert(developerPage.includes(`${base}skills/picorunner-developer/SKILL.md`));
      const home = readFileSync(
        new URL("../site-dist/index.html", import.meta.url),
        "utf8",
      );
      const apps = readFileSync(
        new URL("../site-dist/apps/index.html", import.meta.url),
        "utf8",
      );
      assert(home.includes(`href="${base}apps/"`));
      assert(home.includes('class="nav-toggle"'));
      assert(home.includes('aria-controls="site-nav"'));
      assert(home.includes('id="site-nav"'));
      assert(!home.includes(">Open PicoRunner</a>"));
      assert(!home.includes("id=\"search\""));
      assert(apps.includes("id=\"search\""));
      assert(apps.includes(`${catalog.apps.length} apps`));
      assert(apps.includes("View app"));
      assert(!apps.includes("setup status"));
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
      assert(developers.includes("developers/manifest/"));
      const reference = readFileSync(new URL("../site-dist/developers/manifest/index.html", import.meta.url), "utf8");
      assert(reference.includes('<table class="manifest-table">'));
      assert(reference.includes("runtime.kind"));
      assert(reference.includes("setup.steps[].working_directory"));
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
