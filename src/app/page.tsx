import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/data/products";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <p className="eyebrow">งานกะลามะพร้าว · ผลิตตามออเดอร์</p>
        <h1>จากกะลาธรรมดา<br />สู่งานที่มีเรื่องราว</h1>
        <p className="intro">ของใช้ ของตกแต่ง และของที่ระลึกจากกะลามะพร้าว<br />งานจากครอบครัวเรา ที่ตั้งใจทำตามออเดอร์ของคุณ</p>
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
        <h2>มีแบบหรือจำนวนที่ต้องการในใจแล้ว?</h2>
        <p>เลือกสินค้าที่สนใจ แล้วพูดคุยเรื่องรูปแบบ จำนวน ราคา และระยะเวลาผลิตกับเราก่อนสั่งทำ</p>
        <Link href="/how-to-order">อ่านขั้นตอนการสั่งซื้อ →</Link>
      </section>
    </>
  );
}
