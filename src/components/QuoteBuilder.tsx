"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useQuote } from "@/components/QuoteProvider";
import { buildQuoteMessage, isValidQuantity } from "@/lib/quote";
import type { Product } from "@/types/product";

export default function QuoteBuilder({ products, shopName, contactUrl }: { products: Product[]; shopName: string; contactUrl: string }) {
  const { draft, ready, storageUnavailable, setQuantity, removeItem, setDetails } = useQuote();
  const summaryRef = useRef<HTMLTextAreaElement>(null);
  const [copiedMessage, setCopiedMessage] = useState("");
  const [copyError, setCopyError] = useState(false);
  const [copying, setCopying] = useState(false);
  const message = buildQuoteMessage(draft, products, shopName);
  const copied = !!message && copiedMessage === message;

  async function copySummary() {
    setCopying(true);
    setCopyError(false);
    try {
      await navigator.clipboard.writeText(message);
      setCopiedMessage(message);
    } catch {
      setCopiedMessage("");
      setCopyError(true);
      summaryRef.current?.focus();
      summaryRef.current?.select();
    } finally { setCopying(false); }
  }

  if (!ready) return <p role="status">กำลังโหลดรายการขอราคา…</p>;
  if (!draft.items.length) return <div className="callout"><h2>ยังไม่มีสินค้าในรายการ</h2><p>เลือกสินค้าที่สนใจ แล้วกดเพิ่มในรายการขอราคา</p><Link className="button" href="/products">เลือกชมสินค้า</Link></div>;

  return (
    <>
      <p className="quote-notice">รายการนี้ยังไม่ได้ส่งถึงร้าน กรุณาคัดลอกข้อความแล้วนำไปวางในแชท LINE เพื่อสอบถามราคา</p>
      {storageUnavailable && <p role="status" className="field-error">เบราว์เซอร์นี้บันทึกรายการไม่ได้ กรุณาคัดลอกข้อความก่อนปิดหรือรีโหลดหน้า</p>}
      <div className="quote-layout">
        <div>
          <h2>สินค้าที่เลือก ({draft.items.length} รายการ)</h2>
          <ul className="quote-items">
            {draft.items.map((item) => {
              const product = products.find((candidate) => candidate.id === item.productId);
              if (!product) return null;
              const valid = isValidQuantity(item.quantity);
              return <li key={item.productId} className="quote-item">
                <div><Link href={`/products/${product.slug}/`}><strong>{product.name}</strong></Link><p className="eyebrow">{product.id}</p></div>
                <div className="field">
                  <label htmlFor={`qty-${item.productId}`}>จำนวน {product.name} (ชิ้น)</label>
                  <input id={`qty-${item.productId}`} type="number" min="1" max="99999" step="1" value={item.quantity} onChange={(event) => { setQuantity(item.productId, event.target.value); setCopyError(false); }} aria-invalid={!valid} aria-describedby={!valid ? `error-${item.productId}` : undefined} />
                  {!valid && <small className="field-error" id={`error-${item.productId}`}>ใส่จำนวนเต็ม 1–99,999 ชิ้น</small>}
                </div>
                <button className="remove-item" type="button" onClick={() => removeItem(item.productId)} aria-label={`ลบ${product.name}ออกจากรายการ`}>ลบ</button>
              </li>;
            })}
          </ul>
          <Link className="text-link" href="/products">+ เลือกสินค้าเพิ่มเติม</Link>
          <div className="quote-details">
            <div className="field">
              <label htmlFor="needed-by">วันที่ต้องการใช้ (ถ้ามี)</label>
              <input id="needed-by" type="date" value={draft.neededBy} onChange={(event) => { setDetails({ neededBy: event.target.value }); setCopyError(false); }} />
              <small>ร้านจะตรวจสอบและยืนยันกำหนดผลิตอีกครั้ง</small>
            </div>
            <div className="field">
              <label htmlFor="quote-notes">รายละเอียดเพิ่มเติม (ถ้ามี)</label>
              <textarea id="quote-notes" rows={4} maxLength={1000} placeholder="เช่น ขนาดหรือรูปแบบที่ต้องการ จังหวัดที่จัดส่ง" value={draft.notes} onChange={(event) => { setDetails({ notes: event.target.value }); setCopyError(false); }} />
              <small>{draft.notes.length}/1,000 ตัวอักษร</small>
            </div>
          </div>
        </div>
        <section className="quote-summary" aria-labelledby="summary-heading">
          <h2 id="summary-heading">สรุปเพื่อสอบถามราคา</h2>
          <label htmlFor="quote-message">ข้อความสำหรับส่งให้ร้าน</label>
          <textarea id="quote-message" ref={summaryRef} readOnly rows={12} value={message} placeholder="กรุณาใส่จำนวนสินค้าให้ถูกต้องก่อนคัดลอก" />
          <button className="button" type="button" disabled={!message || copying} onClick={copySummary}>{copying ? "กำลังคัดลอก…" : copied ? "คัดลอกแล้ว ✓" : "1. คัดลอกรายการ"}</button>
          <p role="status" className="quote-feedback">{copyError ? "คัดลอกอัตโนมัติไม่ได้ กรุณาคัดลอกข้อความจากช่องด้านบนด้วยตนเอง" : copied ? "คัดลอกแล้ว เปิด LINE ร้านแล้ววางข้อความในแชทได้เลย" : "ตรวจรายการก่อนคัดลอก แล้วนำข้อความไปวางใน LINE"}</p>
          {contactUrl ? <a className="button secondary" href={contactUrl} target="_blank" rel="noopener noreferrer">2. เปิด LINE ร้าน</a> : <Link href="/how-to-order#contact">ดูช่องทางติดต่อร้าน</Link>}
          <p className="quote-feedback">การเปิด LINE จะยังไม่ส่งข้อความหรือยืนยันออเดอร์ ราคาและกำหนดส่งต้องตกลงกับร้านก่อน</p>
        </section>
      </div>
      <p className="quote-feedback">รายการและหมายเหตุจะถูกเก็บไว้ในเบราว์เซอร์เครื่องนี้ จนกว่าคุณจะลบรายการหรือข้อมูลเว็บไซต์</p>
    </>
  );
}
