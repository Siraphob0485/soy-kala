import type { Metadata } from "next";
import ProductGallery from "@/components/ProductGallery";
import { getProducts } from "@/data/products";

export const metadata: Metadata = {
  alternates: { canonical: "/products/" },
  title: "สินค้ากะลามะพร้าว ของใช้ ของตกแต่ง และของที่ระลึก",
  description: "รวมสินค้าจากกะลามะพร้าว ทั้งเต่ากะลา ถ้วยกะลา ที่วางสบู่ โคมไฟ และกระบวย เลือกดูตามหมวดหมู่และสอบถามรายละเอียดการสั่งผลิตกับร้าน",
};
export default function ProductsPage() {
  return (
    <section className="section">
      <p className="eyebrow">แกลลอรี่งานกะลา</p><h1>สินค้าจากกะลามะพร้าว</h1>
      <p className="intro">เลือกชมงานจากร้านซอยกะลา นครนายก รับผลิตจำนวนมากและรับรายชิ้น สอบถามรายละเอียดก่อนสั่งผลิต</p>
      <ProductGallery products={getProducts()} />
    </section>
  );
}
