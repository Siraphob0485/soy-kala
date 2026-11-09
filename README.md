# Soy Kala — เว็บแกลลอรี่งานกะลามะพร้าว

โครงโปรเจกต์สำหรับเรียนรู้และต่อยอดร้านผลิตตามออเดอร์ ใช้ Next.js App Router, TypeScript และ CSS ธรรมดา ชื่อ Soy Kala เป็นชื่อชั่วคราว

## เริ่มใช้งาน

ใช้ Node.js 20.9 ขึ้นไป (ตอนสร้างใช้ Node.js 22)

```powershell
cd O:\NEXT\soy-kala
npm install
npm run dev
```

เปิด http://localhost:3000 หากติดตั้ง dependencies แล้ว ข้าม `npm install` ได้
หาก PowerShell ไม่ยอมเรียก `npm.ps1` ลองใช้ `npm.cmd run dev` แทน

## โครงสร้าง

```text
src/
├── app/
│   ├── layout.tsx                 โครงร่วม: เมนู ส่วนท้าย metadata
│   ├── globals.css                สีและรูปแบบ รองรับมือถือ
│   ├── page.tsx                   หน้าแรก /
│   ├── not-found.tsx              หน้า 404
│   ├── products/
│   │   ├── page.tsx               แกลลอรี่ /products
│   │   └── [slug]/page.tsx        รายละเอียด /products/coconut-turtle
│   └── how-to-order/page.tsx      วิธีสั่งซื้อและช่องทางติดต่อ
├── components/
│   ├── ProductCard.tsx
│   ├── ProductImage.tsx
│   └── ProductGallery.tsx         Client Component สำหรับกรองหมวดหมู่
├── config/site.ts                ชื่อร้าน คำอธิบาย และ URL ติดต่อ
├── data/products.ts              ข้อมูลตัวอย่างและฟังก์ชันอ่านสินค้า
└── types/product.ts              รูปแบบข้อมูลสินค้าและหมวดหมู่
public/images/products/           เก็บรูปสินค้าจริง
```

## ลองแก้ทีละส่วน

1. เปลี่ยนชื่อร้านและคำอธิบายใน `src/config/site.ts`
2. แก้ข้อมูลสินค้าใน `src/data/products.ts` โดยให้ `id` และ `slug` ไม่ซ้ำกัน
3. วางรูป เช่น `turtle.jpg` ใน `public/images/products/` แล้วแก้ `images` ของสินค้าเป็น `["/images/products/turtle.jpg"]` ใส่หลายรูปได้
4. แก้สี `--accent` และ `--background` ใน `src/app/globals.css`
5. ใส่ URL LINE หรือ Facebook จริงใน `contactUrl` ปุ่มติดต่อจึงจะแสดง

ยังไม่มีรูปสินค้าจริง จึงแสดงพื้นที่ว่างพร้อมชื่อสินค้า ขนาด ราคา และระยะเวลาผลิตไม่ได้สมมติขึ้น ต้องตรวจรายละเอียดสินค้าและขั้นตอนสั่งซื้อกับร้านก่อนเผยแพร่

## แนวคิดที่ใช้

- `page.tsx` กำหนดแต่ละหน้า ส่วน `layout.tsx` ครอบทุกหน้า
- หน้าเว็บเป็น Server Components โดยค่าเริ่มต้น
- `ProductGallery` ใช้ `"use client"` เพราะมี `useState` และการกดกรองหมวดหมู่
- หน้า `[slug]` ใช้ URL เพื่อหาสินค้า และเรียก `notFound()` หากไม่มีสินค้า
- `getProducts()` และ `getProductBySlug()` แยกจุดอ่านข้อมูลไว้ให้เปลี่ยนเป็นฐานข้อมูลภายหลัง

## ตรวจสอบและรันแบบ production

```powershell
npm run build
npm start
```

## ต่อยอดระบบรับออเดอร์

ตอนนี้เป็นแกลลอรี่เท่านั้น ยังไม่มีการบันทึกออเดอร์ ฐานข้อมูล ระบบสมาชิก หรือการชำระเงิน

ขั้นถัดไปคือเพิ่มรายการขอใบเสนอราคา (รหัสสินค้า + จำนวน + หมายเหตุ), ฟอร์มติดต่อ, การตรวจข้อมูลบน server และฐานข้อมูล จากนั้นเพิ่มหลังบ้านที่มีการยืนยันตัวตนและตรวจสิทธิ์เพื่อจัดการสินค้าและคำขอ ก่อนพิจารณาระบบมัดจำ

เอกสารอ้างอิง: https://nextjs.org/docs/app/getting-started/installation
