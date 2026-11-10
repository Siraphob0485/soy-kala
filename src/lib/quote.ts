import type { Product } from "../types/product";

export type QuoteItem = { productId: string; quantity: string };
export type QuoteDraft = { items: QuoteItem[]; neededBy: string; notes: string };
export const EMPTY_QUOTE: QuoteDraft = { items: [], neededBy: "", notes: "" };
export const QUOTE_STORAGE_KEY = "soy-kala:quote:v1";

export function isValidQuantity(value: string): boolean {
  return /^\d{1,5}$/.test(value) && Number(value) >= 1 && Number(value) <= 99999;
}

export function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function restoreQuote(raw: string | null, products: Product[]): QuoteDraft {
  if (!raw) return EMPTY_QUOTE;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.items)) return EMPTY_QUOTE;
    const ids = new Set(products.map((product) => product.id));
    const seen = new Set<string>();
    const items: QuoteItem[] = [];
    for (const item of parsed.items) {
      if (!item || !ids.has(item.productId) || seen.has(item.productId)) continue;
      seen.add(item.productId);
      items.push({ productId: item.productId, quantity: typeof item.quantity === "string" ? item.quantity.slice(0, 8) : "" });
    }
    return {
      items,
      neededBy: typeof parsed.neededBy === "string" && isValidDate(parsed.neededBy) ? parsed.neededBy : "",
      notes: typeof parsed.notes === "string" ? parsed.notes.slice(0, 1000) : "",
    };
  } catch {
    return EMPTY_QUOTE;
  }
}

export function buildQuoteMessage(draft: QuoteDraft, products: Product[], shopName: string): string {
  if (!draft.items.length || draft.items.some((item) => !isValidQuantity(item.quantity))) return "";
  const lines = draft.items.map((item) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    return product ? `- ${product.name} (${product.id}) จำนวน ${Number(item.quantity)} ชิ้น` : "";
  });
  if (lines.some((line) => !line)) return "";
  const date = isValidDate(draft.neededBy) ? draft.neededBy.split("-").reverse().join("/") : "ยังไม่ระบุ";
  return [
    `ขอสอบถามราคาจากร้าน${shopName}`,
    ...lines,
    `วันที่ต้องการใช้: ${date}`,
    `รายละเอียดเพิ่มเติม: ${draft.notes.trim() || "ไม่มี"}`,
    "รบกวนแจ้งราคา ระยะเวลาผลิต และค่าจัดส่ง ขอบคุณครับ/ค่ะ",
  ].join("\n");
}
