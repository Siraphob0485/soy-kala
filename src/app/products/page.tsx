import type { Metadata } from "next";
import ProductGallery from "@/components/ProductGallery";
import { getProducts } from "@/data/products";

export const metadata: Metadata = { title: "สินค้าของเรา" };
export default function ProductsPage() {
  return (
    <section className="section">
      <p className="eyebrow">แกลลอรี่งานกะลา</p><h1>สินค้าของเรา</h1>
      <p className="intro">เลือกชมแบบที่ชอบ แล้วสอบถามรายละเอียดก่อนสั่งผลิต</p>
      <ProductGallery products={getProducts()} />
    </section>
  );
}
