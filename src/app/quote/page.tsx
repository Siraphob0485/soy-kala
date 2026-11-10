import type { Metadata } from "next";
import QuoteBuilder from "@/components/QuoteBuilder";
import { getProducts } from "@/data/products";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "รายการขอราคางานกะลามะพร้าว",
  description: "เลือกสินค้าและจำนวน พร้อมวันที่ต้องการใช้ แล้วคัดลอกรายการไปสอบถามราคากับร้านซอยกะลาทาง LINE",
  alternates: { canonical: "/quote/" },
  robots: { index: false, follow: true },
};

export default function QuotePage() {
  return <section className="section">
    <p className="eyebrow">คุยรายละเอียดก่อนสั่งผลิต</p>
    <h1>รายการขอราคา</h1>
    <QuoteBuilder products={getProducts()} shopName={siteConfig.name} contactUrl={siteConfig.contactUrl} />
  </section>;
}
