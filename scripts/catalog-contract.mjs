export const CATEGORIES = ["Everyday life", "Productivity", "Creativity", "Photos & media", "Learning", "Personal finance", "Wellbeing"];
export const STATUSES = [
  "unverified",
  "source-reviewed",
  "verified",
  "blocked",
];
export const repositoryPattern =
  /^https:\/\/github\.com\/[A-Za-z0-9_][A-Za-z0-9_.-]*\/[A-Za-z0-9_][A-Za-z0-9_.-]*$/;
export const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export function installUrl(app) {
  if (!repositoryPattern.test(app.repository))
    throw new Error("Invalid repository");
  return `oven://install?repository=${encodeURIComponent(app.repository)}`;
}
export function agentCommand(app) {
  return `open '${installUrl(app)}'`;
}
export function validateCatalog(catalog) {
  const errors = [];
  if (catalog.schemaVersion !== 1 || !Array.isArray(catalog.apps))
    return ["Expected schemaVersion 1 and apps array"];
  const ids = new Set();
  const repos = new Set();
  for (const app of catalog.apps) {
    const label = app.id || "unnamed";
    const fail = (message) => errors.push(`${label}: ${message}`);
    if (!slugPattern.test(app.id) || ids.has(app.id))
      fail("invalid or duplicate id");
    ids.add(app.id);
    if (
      !repositoryPattern.test(app.repository) ||
      repos.has(app.repository?.toLowerCase())
    )
      fail("invalid or duplicate public GitHub repository");
    repos.add(app.repository?.toLowerCase());
    for (const key of ["name", "description", "packageName", "glyph"])
      if (
        typeof app[key] !== "string" ||
        !app[key].trim() ||
        app[key].length > 500
      )
        fail(`invalid ${key}`);
    if (!CATEGORIES.includes(app.category)) fail("unknown category");
    if (!/^#[0-9a-f]{6}$/i.test(app.accent)) fail("accent must be a hex color");
    if (!["dev", "start", "serve"].includes(app.preferredScript))
      fail("unsupported launch script");
    if (
      !Array.isArray(app.tags) ||
      !app.tags.length ||
      app.tags.some((t) => typeof t !== "string" || t.length > 60)
    )
      fail("invalid tags");
    const e = app.editorial;
    if (e?.audience !== "consumer") fail("only consumer apps belong in this catalog");
    if (
      !e ||
      !e.reason?.trim() ||
      !e.bestFor?.trim() ||
      !Array.isArray(e.requirements) ||
      !e.requirements.length ||
      e.requirements.some((x) => typeof x !== "string" || !x.trim())
    )
      fail("editorial reason, bestFor and requirements are required");
    const c = app.compatibility;
    if (!c || !STATUSES.includes(c.status) || !Array.isArray(c.evidence)) {
      fail("invalid compatibility record");
      continue;
    }
    if (
      c.checkedAt !== null &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(c.checkedAt) ||
        !Number.isFinite(Date.parse(c.checkedAt)) ||
        Date.parse(c.checkedAt) > Date.now())
    )
      fail("invalid or future check date");
    if (
      c.evidence.some(
        (x) =>
          !x ||
          typeof x.summary !== "string" ||
          !x.summary.trim() ||
          typeof x.source !== "string" ||
          !/^https:\/\//.test(x.source),
      )
    )
      fail("evidence needs a summary and public HTTPS source");
    if (["source-reviewed", "verified"].includes(c.status)) {
      if (
        !/^[a-f0-9]{40}$/.test(c.commit || "") ||
        !c.checkedAt ||
        !e?.license ||
        !c.evidence.length
      )
        fail("reviewed entries need commit, date, license and evidence");
    }
    if (c.status === "verified") {
      if (!c.platform || !c.launcherVersion)
        fail("verified entries need platform and launcher version");
      for (const kind of [
        "install",
        "launch",
        "health",
        "smoke",
        "restart",
        "cleanup",
      ])
        if (!c.evidence.some((x) => x.kind === kind))
          fail(`verified entry missing ${kind} evidence`);
    }
    if (c.status === "blocked" && !c.evidence.length)
      fail("blocked entries need evidence explaining the blocker");
  }
  return errors;
}
