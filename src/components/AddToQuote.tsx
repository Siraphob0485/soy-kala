"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { useQuote } from "@/components/QuoteProvider";
import { isValidQuantity } from "@/lib/quote";

export default function AddToQuote({ productId, name, compact = false }: { productId: string; name: string; compact?: boolean }) {
  const { draft, ready, addItem } = useQuote();
  const [quantity, setQuantity] = useState("1");
  const [added, setAdded] = useState(false);
  const id = useId();
  const selected = draft.items.some((item) => item.productId === productId);
  const valid = isValidQuantity(quantity);

  if (compact && selected) return <Link className="button secondary" href="/quote">ดูรายการ / แก้ไขจำนวน</Link>;

  return (
    <form className="add-to-quote" onSubmit={(event) => {
      event.preventDefault();
      if (!valid || !ready) return;
      addItem(productId, compact ? "1" : quantity);
      setAdded(true);
    }}>
      {!compact && <div className="field">
        <label htmlFor={id}>จำนวนที่ต้องการ (ชิ้น)</label>
        <input id={id} type="number" min="1" max="99999" step="1" required value={quantity} onChange={(event) => { setQuantity(event.target.value); setAdded(false); }} aria-invalid={!valid} aria-describedby={!valid ? `${id}-error` : undefined} />
        {!valid && <small className="field-error" id={`${id}-error`}>ใส่จำนวนเต็ม 1–99,999 ชิ้น</small>}
      </div>}
      <button className={`button${compact ? " secondary" : ""}`} disabled={!ready || !valid} type="submit" aria-label={`${selected ? "อัปเดตจำนวน" : "เพิ่ม"}${name}ในรายการขอราคา`}>
        {selected ? "อัปเดตจำนวนที่ต้องการ" : "เพิ่มในรายการขอราคา"}
      </button>
      {!compact && <p className="quote-feedback" role="status">{added ? <>บันทึกจำนวนแล้ว · <Link href="/quote">ดูรายการขอราคา →</Link></> : "เลือกสินค้าซ้ำจะเปลี่ยนเป็นจำนวนที่ระบุครั้งล่าสุด"}</p>}
    </form>
  );
}
