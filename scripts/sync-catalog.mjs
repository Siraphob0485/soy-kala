import { readFile, writeFile } from "node:fs/promises";
import { validateCatalog, publicProducts } from "../shared/catalog.mjs";

// A failed CMS fetch must stop the build, never silently resurrect old products.
const config = JSON.parse(await readFile(new URL("../shared/cms-config.json", import.meta.url), "utf8"));
const endpoint = process.env.CMS_CATALOG_URL ?? (config.enabled ? config.catalogUrl : "");
let snapshot;
if (endpoint) {
  const url = new URL(endpoint);
  if (url.protocol !== "https:" && !["127.0.0.1", "localhost"].includes(url.hostname)) throw new Error("CMS_CATALOG_URL must use HTTPS");
  const response = await fetch(url, { signal: AbortSignal.timeout(20000), cache: "no-store" });
  if (!response.ok) throw new Error(`CMS catalog unavailable (${response.status})`);
  const payload = await response.json();
  if (!Number.isInteger(payload.revision) || payload.revision < 1) throw new Error("CMS revision missing");
  const products = validateCatalog(payload.products.map(p => ({ ...p, dimensions: p.dimensions ?? "", visible: true })));
  snapshot = { revision: payload.revision, products: publicProducts(products) };
} else {
  const seed = JSON.parse(await readFile(new URL("../shared/seed-catalog.json", import.meta.url), "utf8"));
  snapshot = { revision: 1, products: publicProducts(validateCatalog(seed)) };
}
await writeFile(new URL("../src/data/catalog.generated.json", import.meta.url), JSON.stringify(snapshot, null, 2) + "\n");
await writeFile(new URL("../public/catalog-version.json", import.meta.url), JSON.stringify({ revision: snapshot.revision }) + "\n");
console.log(`Catalog ready: ${snapshot.products.length} products, revision ${snapshot.revision}`);
