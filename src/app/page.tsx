import type { Metadata } from "next";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/data/products";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  title: "รับผลิตงานกะลามะพร้าวและของที่ระลึก นครนายก",
  description: "ซอยกะลา นครนายก รับผลิตเต่ากะลา ถ้วยกะลา ของใช้และของที่ระลึกจากกะลามะพร้าว เน้นสั่งจำนวนมากและรับรายชิ้น ติดต่อสอบถามรูปแบบ ราคา และระยะเวลาผลิต",
};

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <p className="eyebrow">ซอยกะลา · งานกะลามะพร้าวจากนครนายก</p>
        <h1>รับผลิตงานกะลามะพร้าว<br />ของใช้และของที่ระลึก</h1>
        <p className="intro">งานจากครอบครัวเรา ผลิตตามออเดอร์ เน้นสั่งจำนวนมากและรับรายชิ้น<br />เลือกแบบที่สนใจ แล้วคุยรายละเอียดให้เหมาะกับจำนวนที่คุณต้องการ</p>
        <div className="actions">
          <Link className="button" href="/products">เลือกชมสินค้า</Link>
          <Link className="button secondary" href="/how-to-order">วิธีสั่งทำ</Link>
        </div>
      </section>
      <section className="section" aria-labelledby="featured-heading">
        <div className="section-heading"><h2 id="featured-heading">รู้จักงานของเรา</h2><Link href="/products">ดูสินค้าทั้งหมด →</Link></div>
        <div className="product-grid">{getProducts().slice(0, 3).map((product) => <ProductCard key={product.id} product={product} />)}</div>
      </section>
      <section className="callout">
        <h2>สั่งจำนวนมากหรือรายชิ้น คุยกับเราได้</h2>
        <p>เลือกสินค้าได้หลายแบบ ระบุจำนวนและวันที่ต้องการใช้ แล้วคัดลอกรายการไปคุยกับร้านทาง LINE เพื่อสอบถามราคาและระยะเวลาผลิต</p>
        <div className="actions">
          <Link className="button" href="/quote">ดูรายการขอราคา</Link>
          <Link className="button secondary" href="/how-to-order">อ่านขั้นตอนการสั่งซื้อ</Link>
        </div>
        <p className="quote-feedback"><Link href="/how-to-order/#faq">มีข้อสงสัย? อ่านคำถามที่พบบ่อยก่อนสั่งทำ →</Link></p>
      </section>
    </>
  );
}
