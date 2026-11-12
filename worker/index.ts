import type { D1Database, R2Bucket } from "@cloudflare/workers-types";
import { validateCatalog, validateProduct, publicProducts, imageType, MAX_IMAGE_BYTES } from "../shared/catalog.mjs";

type Env = {
  DB: D1Database;
  MEDIA: R2Bucket;
  ASSETS: { fetch(request: Request): Promise<Response> };
  ADMIN_KEY_HASH?: string;
  DEPLOY_HOOK_URL?: string;
};
type Row = { draft: string; revision: number; published: string; published_revision: number; published_at: string };
const COOKIE = "soy_kala_admin";
const SESSION_SECONDS = 8 * 60 * 60;
const encoder = new TextEncoder();
class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }
function json(data: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", ...headers } });
}
async function digest(value: string) {
  return [...new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value)))].map(b => b.toString(16).padStart(2, "0")).join("");
}
function same(a: string, b: string) { let result = a.length ^ b.length; for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ (b.charCodeAt(i) || 0); return result === 0; }
function cookie(request: Request, value: string, seconds: number) {
  return `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${seconds}${new URL(request.url).protocol === "https:" ? "; Secure" : ""}`;
}
function token(request: Request) { return request.headers.get("Cookie")?.split(";").map(p => p.trim()).find(p => p.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1) ?? ""; }
async function authenticated(request: Request, env: Env) {
  if (!env.ADMIN_KEY_HASH || !/^[a-f0-9]{64}$/.test(env.ADMIN_KEY_HASH)) return false;
  const value = token(request);
  if (!/^[a-f0-9]{64}$/.test(value)) return false;
  return !!await env.DB.prepare("SELECT token_hash FROM sessions WHERE token_hash = ? AND credential_version = ? AND expires_at > ?").bind(await digest(value), env.ADMIN_KEY_HASH, Date.now()).first();
}
export async function readBody(request: Request, limit: number) {
  if (Number(request.headers.get("Content-Length")) > limit) throw new HttpError(413, "ไฟล์หรือข้อมูลมีขนาดใหญ่เกินกำหนด");
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "ไม่พบข้อมูล");
  const chunks: Uint8Array[] = []; let total = 0;
  while (true) {
    const { value, done } = await reader.read(); if (done) break;
    total += value.length;
    if (total > limit) { await reader.cancel(); throw new HttpError(413, "ไฟล์หรือข้อมูลมีขนาดใหญ่เกินกำหนด"); }
    chunks.push(value);
  }
  const buffer = new Uint8Array(total); let offset = 0;
  for (const chunk of chunks) { buffer.set(chunk, offset); offset += chunk.length; }
  return buffer;
}
async function body(request: Request) {
  if (request.headers.get("Content-Type")?.split(";")[0] !== "application/json") throw new HttpError(415, "ต้องส่งข้อมูลแบบ JSON");
  try {
    const parsed = JSON.parse(new TextDecoder().decode(await readBody(request, 100000)));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new HttpError(400, "ข้อมูลต้องเป็น JSON object");
    return parsed;
  }
  catch (error) { if (error instanceof HttpError) throw error; throw new HttpError(400, "ข้อมูล JSON ไม่ถูกต้อง"); }
}
async function catalog(env: Env): Promise<Row> {
  const row = await env.DB.prepare("SELECT * FROM catalog WHERE id = 1").first<Row>();
  if (!row) throw new HttpError(503, "ยังไม่ได้เตรียมฐานข้อมูลสินค้า");
  return row;
}
function requireRevision(value: unknown) { if (!Number.isInteger(value) || (value as number) < 1) throw new HttpError(400, "เวอร์ชันข้อมูลไม่ถูกต้อง"); }
async function checkImages(images: string[], env: Env) {
  for (const path of images) if (path.startsWith("/media/") && !await env.MEDIA.head(path.slice(7))) throw new HttpError(400, "ไม่พบไฟล์รูปที่เลือก กรุณาอัปโหลดใหม่");
}
async function rateLimit(request: Request, env: Env) {
  const now = Date.now();
  const ip = request.headers.get("CF-Connecting-IP") ?? "local";
  // Count attempts before verification; atomic upsert prevents parallel bypasses.
  for (const [label, max] of [[await digest(ip), 10], ["account", 50]] as const) {
    const row = await env.DB.prepare("INSERT INTO login_attempts(bucket, attempts, expires_at) VALUES(?, 1, ?) ON CONFLICT(bucket) DO UPDATE SET attempts = CASE WHEN expires_at <= ? THEN 1 ELSE attempts + 1 END, expires_at = CASE WHEN expires_at <= ? THEN excluded.expires_at ELSE expires_at END RETURNING attempts").bind(label, now + 15 * 60 * 1000, now, now).first<{ attempts: number }>();
    if (!row || row.attempts > max) throw new HttpError(429, "ลองเข้าสู่ระบบหลายครั้งเกินไป กรุณารอ 15 นาที");
  }
}
async function handle(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/$/, "");
  if (path.startsWith("/media/")) {
    if (!["GET", "HEAD"].includes(request.method)) throw new HttpError(405, "ไม่รองรับคำสั่งนี้");
    if (!/^[a-f0-9-]{36}\.(jpg|png|webp)$/.test(path.slice(7))) throw new HttpError(404, "ไม่พบรูป");
    if (!env.MEDIA) throw new HttpError(503, "ยังไม่ได้เชื่อมคลังรูป");
    const object = request.method === "HEAD" ? await env.MEDIA.head(path.slice(7)) : await env.MEDIA.get(path.slice(7));
    if (!object) throw new HttpError(404, "ไม่พบรูป");
    return new Response(request.method === "HEAD" ? null : (object as Awaited<ReturnType<R2Bucket["get"]>> & { body: ReadableStream }).body as BodyInit, { headers: { "Content-Type": object.httpMetadata?.contentType ?? "application/octet-stream", "Content-Length": String(object.size), "Cache-Control": "public, max-age=31536000, immutable", "ETag": object.httpEtag, "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "default-src 'none'" } });
  }
  if (!path.startsWith("/api/")) {
    const response = await env.ASSETS.fetch(request);
    if (path === "/admin" || path.startsWith("/admin/")) {
      const headers = new Headers(response.headers);
      headers.set("Cache-Control", "no-store"); headers.set("X-Robots-Tag", "noindex, nofollow"); headers.set("X-Frame-Options", "DENY"); headers.set("Referrer-Policy", "same-origin");
      return new Response(response.body, { status: response.status, headers });
    }
    return response;
  }
  if (!env.DB) throw new HttpError(503, "ยังไม่ได้เชื่อมฐานข้อมูลหลังบ้าน");
  if (path === "/api/catalog" && request.method === "GET") {
    const row = await catalog(env);
    return json({ revision: row.published_revision, products: publicProducts(JSON.parse(row.published)) });
  }
  if (!path.startsWith("/api/admin/")) throw new HttpError(404, "ไม่พบ API");
  if (!["GET", "HEAD"].includes(request.method)) {
    if (request.headers.get("Origin") !== url.origin || request.headers.get("Sec-Fetch-Site") === "cross-site") throw new HttpError(403, "คำขอต้องมาจากเว็บไซต์ร้าน");
  }
  if (!env.ADMIN_KEY_HASH) throw new HttpError(503, "ยังไม่ได้ตั้งรหัสเข้าหลังบ้าน");
  if (path === "/api/admin/login" && request.method === "POST") {
    await rateLimit(request, env);
    const input = await body(request);
    if (typeof input.key !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(input.key) || !same(await digest(input.key), env.ADMIN_KEY_HASH)) throw new HttpError(401, "รหัสเข้าหลังบ้านไม่ถูกต้อง");
    const value = [...crypto.getRandomValues(new Uint8Array(32))].map(b => b.toString(16).padStart(2, "0")).join("");
    await env.DB.batch([
      env.DB.prepare("DELETE FROM sessions WHERE expires_at <= ? OR credential_version != ?").bind(Date.now(), env.ADMIN_KEY_HASH),
      env.DB.prepare("DELETE FROM login_attempts WHERE expires_at <= ?").bind(Date.now()),
      env.DB.prepare("INSERT INTO sessions(token_hash,credential_version,expires_at) VALUES(?,?,?)").bind(await digest(value), env.ADMIN_KEY_HASH, Date.now() + SESSION_SECONDS * 1000),
    ]);
    return json({ ok: true }, 200, { "Set-Cookie": cookie(request, value, SESSION_SECONDS) });
  }
  if (!await authenticated(request, env)) throw new HttpError(401, "กรุณาเข้าสู่ระบบอีกครั้ง");
  if (path === "/api/admin/session" && request.method === "GET") return json({ ok: true });
  if (path === "/api/admin/logout" && request.method === "POST") {
    await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(await digest(token(request))).run();
    return json({ ok: true }, 200, { "Set-Cookie": cookie(request, "", 0) });
  }
  if (path === "/api/admin/catalog" && request.method === "GET") {
    const row = await catalog(env);
    return json({ products: JSON.parse(row.draft), revision: row.revision, publishedRevision: row.published_revision, publishedAt: row.published_at, canUpload: !!env.MEDIA, canPublish: !!env.DEPLOY_HOOK_URL });
  }
  if (path === "/api/admin/products" && request.method === "POST") {
    const input = await body(request); requireRevision(input.revision);
    let product;
    try { product = validateProduct(input.product); } catch (error) { throw new HttpError(400, (error as Error).message); }
    const row = await catalog(env);
    if (row.revision !== input.revision) throw new HttpError(409, "ข้อมูลถูกแก้จากอีกหน้าต่างแล้ว กรุณาโหลดรายการใหม่ก่อนแก้ไข");
    const products = JSON.parse(row.draft) as ReturnType<typeof validateProduct>[];
    if (input.originalId) {
      const index = products.findIndex(p => p.id === input.originalId);
      if (index < 0) throw new HttpError(404, "ไม่พบสินค้า");
      if (product.id !== products[index].id || product.slug !== products[index].slug) throw new HttpError(400, "แก้รหัสหรือลิงก์สินค้าเดิมไม่ได้ เพื่อรักษาลิงก์และรายการขอราคา");
      products[index] = product;
    } else products.push(product);
    try { validateCatalog(products); } catch (error) { throw new HttpError(400, (error as Error).message); }
    await checkImages(product.images, env);
    const result = await env.DB.prepare("UPDATE catalog SET draft = ?, revision = revision + 1 WHERE id = 1 AND revision = ?").bind(JSON.stringify(products), row.revision).run();
    if (!result.meta.changes) throw new HttpError(409, "มีข้อมูลใหม่ กรุณาโหลดรายการอีกครั้ง");
    return json({ ok: true, revision: row.revision + 1 });
  }
  if (path === "/api/admin/media" && request.method === "POST") {
    if (!env.MEDIA) throw new HttpError(503, "ยังไม่ได้เชื่อมคลังรูป");
    const bytes = await readBody(request, MAX_IMAGE_BYTES);
    const type = imageType(bytes);
    if (!type || request.headers.get("Content-Type") !== type.mime) throw new HttpError(415, "รองรับรูป JPEG, PNG และ WebP เท่านั้น");
    const filename = `${crypto.randomUUID()}.${type.extension}`;
    await env.MEDIA.put(filename, bytes, { httpMetadata: { contentType: type.mime } });
    return json({ url: `/media/${filename}` }, 201);
  }
  if (path === "/api/admin/publish" && request.method === "POST") {
    const input = await body(request); requireRevision(input.revision);
    if (!env.DEPLOY_HOOK_URL || !/^https:\/\/api\.cloudflare\.com\/client\/v4\/workers\/builds\/deploy_hooks\/[a-zA-Z0-9-]+$/.test(env.DEPLOY_HOOK_URL)) throw new HttpError(503, "ยังไม่ได้เชื่อมระบบเผยแพร่เว็บ");
    const row = await catalog(env);
    if (row.revision !== input.revision) throw new HttpError(409, "ข้อมูลถูกแก้แล้ว กรุณาโหลดรายการใหม่ก่อนเผยแพร่");
    const products = validateCatalog(JSON.parse(row.draft));
    if (!products.some(product => product.visible)) throw new HttpError(400, "กรุณาเลือกแสดงสินค้าอย่างน้อย 1 รายการก่อนเผยแพร่");
    for (const product of products) if (product.visible) await checkImages(product.images, env);
    const result = await env.DB.prepare("UPDATE catalog SET published = draft, published_revision = revision, published_at = ? WHERE id = 1 AND revision = ?").bind(new Date().toISOString(), row.revision).run();
    if (!result.meta.changes) throw new HttpError(409, "ข้อมูลถูกแก้แล้ว กรุณาโหลดรายการใหม่");
    // Snapshot persists if the hook fails: retry publishing to queue a new build.
    let response: Response;
    try { response = await fetch(env.DEPLOY_HOOK_URL, { method: "POST", signal: AbortSignal.timeout(15000) }); }
    catch { throw new HttpError(502, "บันทึกชุดเผยแพร่แล้ว แต่เรียกอัปเดตเว็บไม่ได้ กรุณากดเผยแพร่อีกครั้ง"); }
    if (!response.ok) throw new HttpError(502, "บันทึกชุดเผยแพร่แล้ว แต่ Cloudflare ยังไม่รับคำขอ กรุณากดเผยแพร่อีกครั้ง");
    return json({ ok: true, revision: row.revision, message: "ส่งคำขออัปเดตเว็บแล้ว กรุณารอจนเวอร์ชันบนหน้าร้านตรงกับชุดเผยแพร่" });
  }
  throw new HttpError(404, "ไม่พบ API");
}
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try { return await handle(request, env); }
    catch (error) {
      if (error instanceof HttpError) return json({ error: error.message }, error.status);
      console.error("CMS request failed", error instanceof Error ? error.name : "UnknownError");
      return json({ error: "ระบบหลังบ้านขัดข้อง กรุณาลองใหม่หรือตรวจการตั้งค่า" }, 500);
    }
  },
};
