import { readFile, writeFile, rename } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { validateCatalog } from "./catalog-contract.mjs";

export async function refreshStars(catalog, { fetchRepository = fetch, token, now = () => new Date().toISOString(), warn = console.warn } = {}) {
  const errors = validateCatalog(catalog);
  if (errors.length) throw new Error(errors.join("\n"));
  let refreshed = 0;
  for (const app of catalog.apps) {
    try {
      const repository = app.repository.slice("https://github.com/".length);
      const response = await fetchRepository(`https://api.github.com/repos/${repository}`, {
        headers: { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        signal: AbortSignal.timeout(15000),
        redirect: "error",
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const { stargazers_count: count } = await response.json();
      if (!Number.isSafeInteger(count) || count < 0) throw new Error("Invalid star count");
      app.stars = count;
      app.starsUpdatedAt = now();
      refreshed++;
    } catch {
      // Never log request headers or credentials. Preserve the last successful snapshot.
      warn(`Could not refresh stars for ${app.id}; retaining previous metadata.`);
    }
  }
  return refreshed;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const path = new URL("../catalog/apps.json", import.meta.url);
  const catalog = JSON.parse(await readFile(path, "utf8"));
  const refreshed = await refreshStars(catalog, { token: process.env.GITHUB_TOKEN });
  if (!refreshed) throw new Error("No GitHub star counts refreshed; catalog was not changed.");
  const temporary = new URL("../catalog/apps.json.tmp", import.meta.url);
  await writeFile(temporary, JSON.stringify(catalog, null, 2) + "\n");
  await rename(temporary, path);
  console.log(`Refreshed stars for ${refreshed}/${catalog.apps.length} apps.`);
}
