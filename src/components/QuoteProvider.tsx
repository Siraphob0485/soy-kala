"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Product } from "@/types/product";
import { EMPTY_QUOTE, QUOTE_STORAGE_KEY, restoreQuote, isValidQuantity, type QuoteDraft } from "@/lib/quote";

type QuoteContextValue = {
  draft: QuoteDraft;
  ready: boolean;
  storageUnavailable: boolean;
  addItem: (productId: string, quantity: string) => void;
  setQuantity: (productId: string, quantity: string) => void;
  removeItem: (productId: string) => void;
  setDetails: (details: Partial<Pick<QuoteDraft, "neededBy" | "notes">>) => void;
};

const QuoteContext = createContext<QuoteContextValue | null>(null);

export default function QuoteProvider({ products, children }: { products: Product[]; children: React.ReactNode }) {
  const [draft, setDraft] = useState<QuoteDraft>(EMPTY_QUOTE);
  const [ready, setReady] = useState(false);
  const [storageUnavailable, setStorageUnavailable] = useState(false);

  useEffect(() => {
    // อ่านหลัง hydration เพื่อให้ HTML จาก server และ client ครั้งแรกตรงกัน
    try { setDraft(restoreQuote(localStorage.getItem(QUOTE_STORAGE_KEY), products)); }
    catch { setStorageUnavailable(true); }
    setReady(true);
  }, [products]);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(QUOTE_STORAGE_KEY, JSON.stringify(draft)); }
    catch { setStorageUnavailable(true); }
  }, [draft, ready]);

  function addItem(productId: string, quantity: string) {
    if (!ready || !isValidQuantity(quantity) || !products.some((product) => product.id === productId)) return;
    setDraft((previous) => ({
      ...previous,
      // เลือกสินค้าซ้ำจะอัปเดตจำนวนที่ต้องการ ไม่สร้างบรรทัดซ้ำ
      items: previous.items.some((item) => item.productId === productId)
        ? previous.items.map((item) => item.productId === productId ? { ...item, quantity } : item)
        : [...previous.items, { productId, quantity }],
    }));
  }

  return (
    <QuoteContext.Provider value={{
      draft, ready, storageUnavailable, addItem,
      setQuantity: (productId, quantity) => setDraft((previous) => ({ ...previous, items: previous.items.map((item) => item.productId === productId ? { ...item, quantity: quantity.slice(0, 8) } : item) })),
      removeItem: (productId) => setDraft((previous) => ({ ...previous, items: previous.items.filter((item) => item.productId !== productId) })),
      setDetails: (details) => setDraft((previous) => ({ ...previous, ...details })),
    }}>
      {children}
    </QuoteContext.Provider>
  );
}

export function useQuote() {
  const value = useContext(QuoteContext);
  if (!value) throw new Error("QuoteProvider is required");
  return value;
}
