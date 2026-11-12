import { test } from "node:test";
import assert from "node:assert/strict";
import { randomBytes, createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { build } from "esbuild";
import { Miniflare, convertV4MiniflareOptions } from "miniflare";

const origin = "https://cms.example.test";
const key = randomBytes(32).toString("base64url");
const hash = createHash("sha256").update(key).digest("hex");
const bundled = await build({ entryPoints: ["worker/index.ts"], bundle: true, write: false, format: "esm", platform: "browser" });
const { readBody } = await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString("base64")}`);
const seed = JSON.parse(await readFile("shared/seed-catalog.json", "utf8"));

test("CMS authorization, publication, uploads, conflicts and sessions", async t => {
  let hooks = 0;
  const mf = new Miniflare(convertV4MiniflareOptions({ modules: true, script: bundled.outputFiles[0].text, compatibilityDate: "2026-11-11", d1Databases: ["DB"], r2Buckets: ["MEDIA"], bindings: { ADMIN_KEY_HASH: hash, DEPLOY_HOOK_URL: "https://api.cloudflare.com/client/v4/workers/builds/deploy_hooks/test-hook" }, outboundService: () => { hooks++; return new Response('{"success":true}', { headers: { "Content-Type": "application/json" } }); } }));
  t.after(() => mf.dispose());
  const db = await mf.getD1Database("DB");
  const migration = await readFile("migrations/0001_cms.sql", "utf8");
  for (const statement of migration.split(";").map(s => s.trim()).filter(Boolean)) await db.prepare(statement).run();
  await db.prepare("INSERT INTO catalog(id,draft,published,published_at) VALUES(1,?,?,?)").bind(JSON.stringify(seed), JSON.stringify(seed), new Date().toISOString()).run();
  let session = "";
  const request = (path, method = "GET", payload, options = {}) => mf.dispatchFetch(origin + path, { method, headers: { Origin: origin, "Content-Type": "application/json", Cookie: session, ...options.headers }, body: payload === undefined ? undefined : JSON.stringify(payload) });

  await t.test("read/write endpoints reject anonymous and cross-site requests", async () => {
    assert.equal((await request("/api/admin/catalog")).status, 401);
    assert.equal((await request("/api/admin/products", "POST", {})).status, 401);
    assert.equal((await request("/api/admin/login", "POST", { key }, { headers: { Origin: "https://evil.test" } })).status, 403);
    assert.equal((await request("/api/admin/login", "POST", { key: "bad" })).status, 401);
    assert.equal((await request("/api/admin/login", "POST", null)).status, 400);
    const response = await request("/api/admin/login", "POST", { key });
    assert.equal(response.status, 200);
    const cookie = response.headers.get("set-cookie");
    assert.match(cookie, /HttpOnly/); assert.match(cookie, /SameSite=Strict/); assert.match(cookie, /Secure/);
    session = cookie.split(";")[0];
    assert.equal((await request("/api/admin/catalog")).status, 200);
    assert.equal((await request("/api/admin/products", "POST", {}, { headers: { Origin: "https://evil.test" } })).status, 403);
  });

  await t.test("drafts do not change public catalog and stale writers are rejected", async () => {
    const product = { ...seed[0], name: "ชื่อที่แก้ในฉบับร่าง" };
    assert.equal((await request("/api/admin/products", "POST", { originalId: product.id, product, revision: 1 })).status, 200);
    let publicData = await (await request("/api/catalog")).json();
    assert.equal(publicData.products[0].name, seed[0].name);
    assert.equal((await request("/api/admin/products", "POST", { originalId: product.id, product, revision: 1 })).status, 409);
    assert.equal((await request("/api/admin/products", "POST", { product, revision: 2 })).status, 400);
    assert.equal((await request("/api/admin/products", "POST", { originalId: product.id, product: { ...product, slug: "changed-link" }, revision: 2 })).status, 400);
    assert.equal((await request("/api/admin/products", "POST", { originalId: product.id, product: { ...product, images: ["javascript:alert(1)"] }, revision: 2 })).status, 400);
  });

  await t.test("media requires authentication and rejects active content and oversized bodies", async () => {
    let response = await mf.dispatchFetch(origin + "/api/admin/media", { method: "POST", headers: { Origin: origin, "Content-Type": "image/png" }, body: "data" });
    assert.equal(response.status, 401);
    response = await mf.dispatchFetch(origin + "/api/admin/media", { method: "POST", headers: { Origin: origin, Cookie: session, "Content-Type": "image/svg+xml" }, body: '<svg onload="alert(1)"></svg>' });
    assert.equal(response.status, 415);
    // Exercise body limits directly: local HTTP transports can reset an upload
    // when a Worker correctly rejects it before the client finishes sending.
    await assert.rejects(readBody(new Request(origin, { method: "POST", body: new Uint8Array(5 * 1024 * 1024 + 1) }), 5 * 1024 * 1024), error => error.status === 413);
    await assert.rejects(readBody(new Request(origin, { method: "POST", headers: { "Content-Length": "5242881" }, body: "small" }), 5 * 1024 * 1024), error => error.status === 413);
    const jpeg = await readFile("public/images/products/turtle/turtle.jpg");
    response = await mf.dispatchFetch(origin + "/api/admin/media", { method: "POST", headers: { Origin: origin, Cookie: session, "Content-Type": "image/jpeg" }, body: jpeg });
    assert.equal(response.status, 201);
    const { url } = await response.json();
    const image = await request(url);
    assert.equal(image.status, 200); assert.equal(image.headers.get("Content-Type"), "image/jpeg");
    assert.equal((await image.arrayBuffer()).byteLength, jpeg.length);
    const product = { ...seed[1], id: "TEST-NEW", slug: "test-new", name: "สินค้าทดสอบ", images: [url] };
    assert.equal((await request("/api/admin/products", "POST", { product, revision: 2 })).status, 200);
  });

  await t.test("publish snapshots only visible products and queues a rebuild", async () => {
    const hidden = { ...seed[0], visible: false };
    assert.equal((await request("/api/admin/products", "POST", { originalId: hidden.id, product: hidden, revision: 3 })).status, 200);
    assert.equal((await request("/api/admin/publish", "POST", { revision: 3 })).status, 409);
    assert.equal((await request("/api/admin/publish", "POST", { revision: 4 })).status, 200);
    assert.equal(hooks, 1);
    const data = await (await request("/api/catalog")).json();
    assert.equal(data.revision, 4);
    assert.equal(data.products.some(p => p.id === hidden.id), false);
    assert.equal(data.products.some(p => p.id === "TEST-NEW"), true);
  });

  await t.test("empty storefront cannot replace the published snapshot", async () => {
    const row = await db.prepare("SELECT draft FROM catalog WHERE id = 1").first();
    const hidden = JSON.parse(row.draft).map(product => ({ ...product, visible: false }));
    await db.prepare("UPDATE catalog SET draft = ?, revision = 5 WHERE id = 1").bind(JSON.stringify(hidden)).run();
    assert.equal((await request("/api/admin/publish", "POST", { revision: 5 })).status, 400);
    assert.equal((await (await request("/api/catalog")).json()).revision, 4);
    assert.equal(hooks, 1);
  });

  await t.test("expired and logged-out sessions cannot mutate data", async () => {
    await db.prepare("UPDATE sessions SET expires_at = 0").run();
    assert.equal((await request("/api/admin/products", "POST", {})).status, 401);
    const login = await request("/api/admin/login", "POST", { key });
    session = login.headers.get("set-cookie").split(";")[0];
    assert.equal((await request("/api/admin/logout", "POST", {})).status, 200);
    assert.equal((await request("/api/admin/catalog")).status, 401);
  });

  await t.test("login attempts are throttled", async () => {
    let response;
    for (let i = 0; i < 11; i++) response = await request("/api/admin/login", "POST", { key: "wrong" });
    assert.equal(response.status, 429);
  });
});
