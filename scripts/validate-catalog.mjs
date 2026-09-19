import { readFile } from "node:fs/promises";
import { validateCatalog } from "./catalog-contract.mjs";
const catalog = JSON.parse(await readFile(new URL("../catalog/apps.json", import.meta.url), "utf8"));
const errors = validateCatalog(catalog);
if (errors.length) { console.error(errors.join("\n")); process.exitCode = 1; }
else console.log(`Catalog valid: ${catalog.apps.length} entries. Validation does not prove runtime compatibility.`);
