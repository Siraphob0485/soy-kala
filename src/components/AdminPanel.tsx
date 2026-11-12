"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import type { Product } from "@/types/product";
import { productCategories } from "@/types/product";

type DraftProduct = Product & { dimensions: string; visible: boolean };
type Catalog = { products: DraftProduct[]; revision: number; publishedRevision: number; publishedAt: string; canUpload: boolean; canPublish: boolean };
const emptyProduct = (): DraftProduct => ({ id: "", slug: "", name: "", category: "ของใช้", description: "", dimensions: "", images: [], madeToOrder: true, visible: false });
class ApiError extends Error { constructor(message: string, public status: number) { super(message); } }
async function api<T>(path: string, method = "GET", payload?: unknown): Promise<T> {
  const response = await fetch(`/api/admin/${path}`, { method, credentials: "same-origin", cache: "no-store", headers: payload === undefined ? undefined : { "Content-Type": "application/json" }, body: payload === undefined ? undefined : JSON.stringify(payload) });
  let result;
  try { result = await response.json(); } catch { throw new ApiError("ยังไม่พบระบบหลังบ้าน กรุณาตรวจการเชื่อมต่อ API", response.status); }
  if (!response.ok) throw new ApiError(result.error ?? "ไม่สามารถทำรายการได้", response.status);
  return result as T;
}

// Normalize photos before upload: strips metadata and bounds decoded dimensions.
async function preparePhoto(file: File): Promise<Blob> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) throw new Error("ใช้รูป JPEG, PNG หรือ WebP ขนาดไม่เกิน 5 MB ต่อรูป");
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale)); canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("เบราว์เซอร์นี้เตรียมรูปไม่ได้");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("เตรียมรูปไม่สำเร็จ")), "image/webp", .88));
  } finally { bitmap.close(); }
}

export default function AdminPanel() {
  const [auth, setAuth] = useState<"loading" | "login" | "ready">("loading");
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [key, setKey] = useState("");
  const [product, setProduct] = useState<DraftProduct | null>(null);
  const [originalId, setOriginalId] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [liveRevision, setLiveRevision] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const editorHeading = useRef<HTMLHeadingElement>(null);

  function fail(reason: unknown) {
    setError(reason instanceof Error ? reason.message : "เกิดข้อผิดพลาด กรุณาลองใหม่");
    if (reason instanceof ApiError && reason.status === 401) setAuth("login");
  }
  async function loadCatalog() { const next = await api<Catalog>("catalog"); setCatalog(next); return next; }
  useEffect(() => {
    let active = true;
    api<Catalog>("catalog").then(data => { if (active) { setCatalog(data); setAuth("ready"); } }).catch(reason => {
      if (active) { setAuth("login"); if (!(reason instanceof ApiError && reason.status === 401)) setError(reason.message); }
    });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    const leave = (event: MouseEvent) => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element).closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link || link.target === "_blank" || new URL(link.href).pathname === window.location.pathname) return;
      if (!window.confirm("มีข้อมูลที่ยังไม่ได้บันทึก ต้องการออกจากหน้านี้หรือไม่?")) { event.preventDefault(); event.stopPropagation(); }
    };
    window.addEventListener("beforeunload", warn);
    document.addEventListener("click", leave, true);
    return () => { window.removeEventListener("beforeunload", warn); document.removeEventListener("click", leave, true); };
  }, [dirty]);
  useEffect(() => {
    if (auth !== "ready") return;
    let active = true;
    const check = async () => {
      try {
        const response = await fetch(`/catalog-version.json?t=${Date.now()}`, { cache: "no-store" });
        const data = await response.json();
        if (active && Number.isInteger(data.revision)) setLiveRevision(data.revision);
      } catch { /* Keep status unknown until a build is reachable. */ }
    };
    void check();
    const interval = window.setInterval(check, 10000);
    return () => { active = false; window.clearInterval(interval); };
  }, [auth]);
  useEffect(() => { if (product) editorHeading.current?.focus(); }, [originalId, !!product]);

  function mayDiscard() { return !dirty || window.confirm("มีข้อมูลที่ยังไม่ได้บันทึก ต้องการออกจากการแก้ไขนี้หรือไม่?"); }
  function edit(next: DraftProduct | null) {
    if (!mayDiscard()) return;
    setProduct(next ? { ...next, images: [...next.images] } : emptyProduct());
    setOriginalId(next?.id ?? null); setDirty(false); setError(""); setNotice("");
  }
  function update(changes: Partial<DraftProduct>) { setProduct(current => current ? { ...current, ...changes } : current); setDirty(true); setNotice(""); }
  async function login(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try { await api("login", "POST", { key: key.trim() }); setKey(""); await loadCatalog(); setAuth("ready"); }
    catch (reason) { fail(reason); } finally { setBusy(false); }
  }
  async function logout() {
    if (!mayDiscard()) return;
    setBusy(true); setError("");
    try { await api("logout", "POST", {}); setCatalog(null); setProduct(null); setDirty(false); setAuth("login"); setNotice(""); }
    catch (reason) { fail(reason); } finally { setBusy(false); }
  }
  async function save(event: FormEvent) {
    event.preventDefault(); if (!catalog || !product) return;
    setBusy(true); setError(""); setNotice("");
    try {
      await api("products", "POST", { product, originalId, revision: catalog.revision });
      setDirty(false); setOriginalId(product.id); await loadCatalog(); setNotice("บันทึกฉบับร่างแล้ว กดเผยแพร่เมื่อพร้อมให้ลูกค้าเห็น");
    } catch (reason) { fail(reason); } finally { setBusy(false); }
  }
  async function upload(files: FileList | null) {
    if (!files?.length || !product) return;
    if (product.images.length + files.length > 10) { setError("สินค้าแต่ละรายการใส่ได้ไม่เกิน 10 รูป"); return; }
    setBusy(true); setError("");
    const uploaded: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const photo = await preparePhoto(file);
        const response = await fetch("/api/admin/media", { method: "POST", credentials: "same-origin", headers: { "Content-Type": photo.type }, body: photo });
        const result = await response.json();
        if (!response.ok) throw new ApiError(result.error ?? "อัปโหลดรูปไม่สำเร็จ", response.status);
        uploaded.push(result.url);
      }
    } catch (reason) { fail(reason); }
    finally { if (uploaded.length) update({ images: [...product.images, ...uploaded] }); setBusy(false); }
  }
  function reorder(index: number, next: number) {
    if (!product) return;
    const images = [...product.images]; [images[index], images[next]] = [images[next], images[index]]; update({ images });
  }
  async function publish() {
    if (!catalog || dirty) return;
    if (!window.confirm(`เผยแพร่สินค้าที่แสดง ${catalog.products.filter(p => p.visible).length} รายการ และซ่อน ${catalog.products.filter(p => !p.visible).length} รายการบนหน้าร้านใช่หรือไม่?`)) return;
    setBusy(true); setError(""); setNotice("");
    try { const result = await api<{ message: string }>("publish", "POST", { revision: catalog.revision }); setNotice(result.message); await loadCatalog(); }
    catch (reason) { fail(reason); } finally { setBusy(false); }
  }

  if (auth === "loading") return <p role="status">กำลังตรวจการเข้าสู่ระบบ…</p>;
  if (auth === "login") return <div className="admin-login">
    <h2>เข้าสู่หลังบ้านร้าน</h2>
    <p>ใช้รหัสเข้าหลังบ้านของเจ้าของร้านเพื่อจัดการสินค้า</p>
    {error && <p role="alert" className="field-error">{error}</p>}
    <form onSubmit={login}>
      <div className="field"><label htmlFor="admin-key">รหัสเข้าหลังบ้าน</label><input id="admin-key" type="password" autoComplete="current-password" required value={key} onChange={event => setKey(event.target.value)} /></div>
      <button className="button" disabled={busy} type="submit">{busy ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}</button>
    </form>
  </div>;

  return <>
    <div className="admin-toolbar"><p>ข้อมูลที่บันทึกจะเป็นฉบับร่างจนกว่าจะกดเผยแพร่</p><button className="button secondary" onClick={logout} disabled={busy}>ออกจากระบบ</button></div>
    {error && <p className="admin-message field-error" role="alert">{error}</p>}
    {notice && <p className="admin-message" role="status">{notice}</p>}
    <section className="admin-publish" aria-labelledby="publish-title">
      <div><h2 id="publish-title">อัปเดตหน้าร้าน</h2><p>ฉบับร่าง #{catalog?.revision} · ชุดเผยแพร่ #{catalog?.publishedRevision} · บนเว็บ {liveRevision === null ? "กำลังตรวจสอบ" : `#${liveRevision}`}</p>
        {catalog && liveRevision !== null && liveRevision < catalog.publishedRevision && <p role="status">กำลังรอเว็บอัปเดต หากรอนานให้ตรวจสถานะ build ใน Cloudflare หรือกดเผยแพร่อีกครั้ง</p>}
        {dirty && <p>บันทึกข้อมูลที่กำลังแก้ไขก่อนเผยแพร่</p>}
        {catalog && !catalog.canPublish && <p>ยังไม่ได้เชื่อมการเผยแพร่เว็บ สามารถบันทึกฉบับร่างได้</p>}
      </div><button className="button" disabled={busy || dirty || !catalog?.canPublish} onClick={publish}>เผยแพร่ขึ้นเว็บ</button>
    </section>
    <div className="admin-layout">
      <section aria-labelledby="admin-products-title" className="admin-products">
        <h2 id="admin-products-title">สินค้า {catalog?.products.length ?? 0} รายการ</h2>
        <div className="admin-list-actions"><button className="button" onClick={() => edit(null)} disabled={busy}>+ เพิ่มสินค้า</button><button className="button secondary" disabled={busy} onClick={async () => { if (!mayDiscard()) return; setBusy(true); try { await loadCatalog(); setProduct(null); setDirty(false); setError(""); } catch (reason) { fail(reason); } finally { setBusy(false); } }}>โหลดรายการใหม่</button></div>
        <div className="field"><label htmlFor="admin-search">ค้นหาชื่อหรือรหัส</label><input id="admin-search" type="search" value={search} onChange={event => setSearch(event.target.value)} /></div>
        <ul className="admin-product-list">{catalog?.products.filter(item => `${item.name} ${item.id}`.toLowerCase().includes(search.toLowerCase())).map(item => <li key={item.id}>
          <button type="button" disabled={busy} aria-pressed={originalId === item.id} onClick={() => edit(item)}><strong>{item.name}</strong><span>{item.id} · {item.visible ? "แสดง" : "ซ่อน"}</span></button>
        </li>)}</ul>
      </section>
      <section className="admin-editor" aria-labelledby="editor-title">
        <h2 ref={editorHeading} tabIndex={-1} id="editor-title">{product ? originalId ? `แก้ไข ${product.name}` : "เพิ่มสินค้าใหม่" : "เลือกสินค้าที่ต้องการแก้ไข"}</h2>
        {product && <form onSubmit={save}>
          <fieldset disabled={busy}>
            <div className="admin-field-grid">
              <div className="field"><label htmlFor="product-id">รหัสสินค้า</label><input id="product-id" value={product.id} required maxLength={40} pattern="[A-Za-z0-9_-]+" readOnly={!!originalId} onChange={event => update({ id: event.target.value })} /></div>
              <div className="field"><label htmlFor="product-slug">ลิงก์สินค้า (ภาษาอังกฤษ)</label><input id="product-slug" value={product.slug} required maxLength={80} pattern="[a-z0-9]+(-[a-z0-9]+)*" readOnly={!!originalId} onChange={event => update({ slug: event.target.value })} /></div>
            </div>
            {originalId && <p className="quote-feedback">รหัสและลิงก์สินค้าเดิมคงไว้ เพื่อให้ลิงก์และรายการขอราคาของลูกค้าใช้งานต่อได้</p>}
            <div className="field"><label htmlFor="product-name">ชื่อสินค้า</label><input id="product-name" value={product.name} required maxLength={120} onChange={event => update({ name: event.target.value })} /></div>
            <div className="field"><label htmlFor="product-category">หมวดหมู่</label><select id="product-category" value={product.category} onChange={event => update({ category: event.target.value as Product["category"] })}>{productCategories.map(category => <option key={category}>{category}</option>)}</select></div>
            <div className="field"><label htmlFor="product-description">รายละเอียด</label><textarea id="product-description" value={product.description} required maxLength={2000} rows={5} onChange={event => update({ description: event.target.value })} /></div>
            <div className="field"><label htmlFor="product-dimensions">ขนาด (ถ้ามี)</label><input id="product-dimensions" value={product.dimensions} maxLength={200} onChange={event => update({ dimensions: event.target.value })} /></div>
            <label className="admin-check"><input type="checkbox" checked={product.madeToOrder} onChange={event => update({ madeToOrder: event.target.checked })} />ผลิตตามออเดอร์</label>
            <label className="admin-check"><input type="checkbox" checked={product.visible} onChange={event => update({ visible: event.target.checked })} />แสดงสินค้านี้เมื่อเผยแพร่</label>
            <h3>รูปสินค้า</h3><p className="quote-feedback">รูปแรกเป็นรูปหลัก · JPEG, PNG หรือ WebP ไม่เกิน 5 MB ต่อรูป สูงสุด 10 รูป รูปที่อัปโหลดใช้สำหรับเผยแพร่บนเว็บร้าน</p>
            <ul className="admin-images">{product.images.map((image, index) => <li key={image}>
              <div className="admin-image"><Image src={image} alt={`${product.name || "สินค้า"} รูปที่ ${index + 1}`} fill sizes="160px" /></div>
              <strong>{index === 0 ? "รูปหลัก" : `รูปที่ ${index + 1}`}</strong>
              <div className="admin-image-actions"><button type="button" disabled={index === 0} aria-label={`เลื่อนรูปที่ ${index + 1} ไปก่อนหน้า`} onClick={() => reorder(index, index - 1)}>←</button><button type="button" disabled={index === product.images.length - 1} aria-label={`เลื่อนรูปที่ ${index + 1} ไปถัดไป`} onClick={() => reorder(index, index + 1)}>→</button><button type="button" onClick={() => update({ images: product.images.filter((_, i) => i !== index) })} aria-label={`เอารูปที่ ${index + 1} ออกจากสินค้า`}>เอาออก</button></div>
            </li>)}</ul>
            <div className="field"><label htmlFor="product-upload">เพิ่มรูปสินค้า</label><input id="product-upload" type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={!catalog?.canUpload} onChange={event => { void upload(event.target.files); event.target.value = ""; }} /></div>
            {catalog && !catalog.canUpload && <p>ยังไม่ได้เชื่อมคลังรูป</p>}
            <div className="actions"><button className="button" type="submit">{busy ? "กำลังบันทึก…" : "บันทึกฉบับร่าง"}</button><button className="button secondary" type="button" onClick={() => { if (mayDiscard()) { setProduct(null); setDirty(false); setOriginalId(null); } }}>ปิดการแก้ไข</button></div>
          </fieldset>
        </form>}
      </section>
    </div>
  </>;
}
