import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  alternates: { canonical: "/how-to-order/" },
  title: "วิธีสั่งผลิตงานกะลามะพร้าวและติดต่อร้าน",
  description: "ขั้นตอนสั่งทำสินค้ากะลามะพร้าว เลือกแบบ แจ้งจำนวน สอบถามราคาและระยะเวลาผลิต พร้อมช่องทางติดต่อร้านเพื่อยืนยันรายละเอียดก่อนสั่งทำ",
};
const steps = [
  { title: "เลือกสินค้าและจำนวน", description: "กดเพิ่มในรายการขอราคาจากหน้าสินค้า เลือกได้หลายแบบ แล้วแก้จำนวนแต่ละรายการได้ในหน้าเดียว" },
  { title: "คัดลอกรายการไปคุยใน LINE", description: "ใส่วันที่ต้องการใช้และหมายเหตุ กดคัดลอกรายการ เปิด LINE ร้าน แล้ววางข้อความและกดส่งในแชท เพื่อสอบถามราคา ระยะเวลาผลิต และค่าจัดส่ง" },
  { title: "ยืนยันการสั่งผลิต", description: "ตกลงรายละเอียดและเงื่อนไขการชำระเงินกับร้านให้ครบถ้วน" },
  { title: "ผลิตและจัดส่ง", description: "ร้านผลิตตามรายละเอียดที่ตกลง และแจ้งการจัดส่งให้ทราบ" },
];
const questions = [
  { question: "สั่งรายชิ้นได้ไหม หรือรับเฉพาะจำนวนมาก?", answer: "ซอยกะลาเน้นรับสั่งผลิตจำนวนมาก และรับรายชิ้นด้วย แจ้งสินค้าที่สนใจพร้อมจำนวนเพื่อสอบถามรายละเอียดกับร้านได้" },
  { question: "ต้องแจ้งอะไรเพื่อขอราคา?", answer: "แจ้งชื่อหรือรหัสสินค้า จำนวนแต่ละแบบ ขนาดหรือรูปแบบที่ต้องการ วันที่ต้องการใช้ และจังหวัดที่จัดส่ง ร้านจะตรวจสอบราคาและค่าจัดส่งก่อนยืนยันการสั่งผลิต" },
  { question: "ใช้เวลาผลิตกี่วัน?", answer: "กรุณาสอบถามร้านตามแบบและจำนวนที่ต้องการ พร้อมแจ้งวันที่ต้องการใช้ เพื่อให้ร้านตรวจสอบและยืนยันกำหนดผลิตก่อนตกลงออเดอร์" },
  { question: "อยากปรับขนาดหรือรูปแบบ ต้องทำอย่างไร?", answer: "เขียนรายละเอียดในช่องหมายเหตุของรายการขอราคา และส่งภาพอ้างอิงเพิ่มเติมทาง LINE ได้ ร้านจะตรวจสอบก่อนว่ารับทำตามรายละเอียดนั้นได้หรือไม่" },
  { question: "เพิ่มรายการขอราคาแล้ว ถือว่าสั่งซื้อหรือยัง?", answer: "ยังไม่ได้สั่งซื้อและรายการยังไม่ถูกส่งถึงร้าน ต้องคัดลอกข้อความไปวางและกดส่งใน LINE ก่อน จากนั้นตกลงราคา กำหนดส่ง และเงื่อนไขการชำระเงินกับร้านให้ครบถ้วน" },
];

export default function HowToOrderPage() {
  return (
    <section className="section">
      <p className="eyebrow">ทำตามออเดอร์ของคุณ</p><h1>สั่งทำอย่างไร?</h1>
      <p className="intro">ซอยกะลา นครนายก รับสั่งผลิตจำนวนมากและรับรายชิ้น กรุณาแจ้งจำนวนและวันที่ต้องการใช้ เพื่อให้ร้านตรวจสอบก่อนยืนยันออเดอร์</p>
      <ol className="steps">{steps.map((step) => <li key={step.title}><h2>{step.title}</h2><p>{step.description}</p></li>)}</ol>
      <div className="actions">
        <Link className="button" href="/products">เลือกสินค้าเพื่อขอราคา</Link>
        <Link className="button secondary" href="/quote">ดูรายการที่เลือกไว้</Link>
      </div>
      <section className="order-preparation" aria-labelledby="prepare-heading">
        <h2 id="prepare-heading">เตรียมข้อมูลก่อนคุยงานสั่งผลิต</h2>
        <p>แจ้งข้อมูลเหล่านี้พร้อมกัน ช่วยให้ร้านตรวจสอบรายละเอียดของงานได้สะดวกขึ้น</p>
        <ul className="order-checklist">
          <li>ชื่อหรือรหัสสินค้า และจำนวนของแต่ละแบบ</li>
          <li>ขนาดหรือรูปแบบที่ต้องการ พร้อมภาพอ้างอิงถ้ามี</li>
          <li>วันที่ต้องการใช้สินค้า</li>
          <li>จังหวัดที่ต้องการให้จัดส่ง</li>
        </ul>
        <p className="quote-feedback">ใส่ข้อมูลในรายการขอราคาได้ ส่วนภาพอ้างอิงส่งเพิ่มในแชท LINE หลังติดต่อร้าน</p>
      </section>
      <section id="faq" className="order-faq" aria-labelledby="faq-heading">
        <h2 id="faq-heading">คำถามที่พบบ่อยก่อนสั่งทำ</h2>
        {questions.map(({ question, answer }) => (
          <details key={question} className="faq-item">
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </section>
      <section id="contact" className="callout">
        <h2>ช่องทางติดต่อร้าน</h2>
        <p>ซอยกะลา จังหวัดนครนายก · งานจากกะลามะพร้าว ผลิตตามออเดอร์</p>
        {siteConfig.contactUrl ? (
          <a className="button" href={siteConfig.contactUrl} target="_blank" rel="noopener noreferrer">คุยกับซอยกะลาทาง LINE</a>
        ) : (
          <p>กำลังเตรียมช่องทางติดต่อออนไลน์ ขณะนี้เว็บไซต์ยังไม่เปิดรับออเดอร์</p>
        )}
      </section>
    </section>
  );
}
