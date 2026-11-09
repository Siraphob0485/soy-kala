import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "วิธีสั่งผลิตงานกะลามะพร้าวและติดต่อร้าน",
  description: "ขั้นตอนสั่งทำสินค้ากะลามะพร้าว เลือกแบบ แจ้งจำนวน สอบถามราคาและระยะเวลาผลิต พร้อมช่องทางติดต่อร้านเพื่อยืนยันรายละเอียดก่อนสั่งทำ",
};
const steps = [
  { title: "เลือกสินค้าที่สนใจ", description: "จดชื่อหรือรหัสสินค้า พร้อมจำนวนที่ต้องการ และรูปแบบที่อยากให้ทำ" },
  { title: "พูดคุยรายละเอียดกับร้าน", description: "สอบถามขนาด ราคา ระยะเวลาผลิต และการจัดส่งก่อนตัดสินใจ" },
  { title: "ยืนยันการสั่งผลิต", description: "ตกลงรายละเอียดและเงื่อนไขการชำระเงินกับร้านให้ครบถ้วน" },
  { title: "ผลิตและจัดส่ง", description: "ร้านผลิตตามรายละเอียดที่ตกลง และแจ้งการจัดส่งให้ทราบ" },
];

export default function HowToOrderPage() {
  return (
    <section className="section">
      <p className="eyebrow">ทำตามออเดอร์ของคุณ</p><h1>สั่งทำอย่างไร?</h1>
      <p className="intro">ซอยกะลา นครนายก รับสั่งผลิตจำนวนมากและรับรายชิ้น กรุณาแจ้งจำนวนและวันที่ต้องการใช้ เพื่อให้ร้านตรวจสอบก่อนยืนยันออเดอร์</p>
      <ol className="steps">{steps.map((step) => <li key={step.title}><h2>{step.title}</h2><p>{step.description}</p></li>)}</ol>
      <section id="contact" className="callout">
        <h2>ช่องทางติดต่อร้าน</h2>
        {siteConfig.contactUrl ? (
          <a className="button" href={siteConfig.contactUrl} target="_blank" rel="noopener noreferrer">ติดต่อสอบถาม / สั่งทำ</a>
        ) : (
          <p>กำลังเตรียมช่องทางติดต่อออนไลน์ ขณะนี้เว็บไซต์ยังไม่เปิดรับออเดอร์</p>
        )}
      </section>
    </section>
  );
}
