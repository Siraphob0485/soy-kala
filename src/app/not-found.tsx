import Link from "next/link";

export default function NotFound() {
  return <section className="section"><p className="eyebrow">404</p><h1>ไม่พบหน้าที่ต้องการ</h1><p>สินค้าหรือหน้านี้อาจไม่มีอยู่</p><Link className="button" href="/products">กลับไปดูสินค้า</Link></section>;
}
