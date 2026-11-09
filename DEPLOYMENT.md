# การเผยแพร่เว็บ Soy Kala

## Cloudflare Workers Static Assets (โฮสติ้งที่กำลังตั้งค่า)

โปรเจกต์หลักตั้งค่า Next.js เป็น static export แล้ว `npm run build` สร้างไฟล์ใน `out/` และ `wrangler.jsonc` ระบุให้เผยแพร่โฟลเดอร์นี้โดยตรง ไม่ต้องใช้ OpenNext

ค่าบนหน้าตั้งค่า Cloudflare:

- Project name: `soy-kala`
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Path: `/`
- Environment variables: ยังไม่ต้องเพิ่ม

เมื่อเชื่อม GitHub เรียบร้อย Cloudflare จะใช้ source จาก branch ที่เลือกมา build และ deploy การแก้ไฟล์ในเครื่องต้อง commit และ push ก่อน

คำสั่งตรวจการตั้งค่าโดยไม่เผยแพร่: `npx wrangler deploy --dry-run`

ต้องตรวจ URL และสถานะ deploy ใน Cloudflare ก่อนถือว่าเว็บออนไลน์แล้ว

## Sites (เว็บส่วนตัวที่เผยแพร่ไว้ก่อนหน้า)

- URL: https://soy-kala-gallery.stormyorangutan.chatgpt.site
- ผู้ให้บริการ: Sites
- Site ID: appgprj_6af18276ad48819189b36ccd7dd6e50e
- สถานะเมื่อ 9 พฤศจิกายน 2026: เผยแพร่สำเร็จแบบส่วนตัว ยังต้องยืนยันการเปิดเป็นสาธารณะ
- Source สำหรับเผยแพร่: `.site-deploy/soy-kala/`
- Hosting manifest: `.site-deploy/soy-kala/.openai/hosting.json`

ชุดเผยแพร่ Sites ใช้ static export โดยตั้ง `output: "export"`, `trailingSlash: true` และ `images.unoptimized: true` ไฟล์เว็บอยู่ใน `out/`

## การอัปเดตครั้งถัดไป

การ push ไป GitHub ยังไม่ทำให้ Sites อัปเดตอัตโนมัติ ให้แก้ไฟล์ในโปรเจกต์หลักแล้วสั่งผู้ช่วยให้อัปเดต Site เดิม โดยใช้ Site ID ข้างบน ห้ามสร้าง Site ใหม่

ผู้ช่วยต้องซิงก์ source และรูปจากโปรเจกต์หลักไปยังชุดเผยแพร่ รักษา hosting manifest และ config สำหรับ static export เดิม จากนั้น build, ตรวจสอบ, ส่ง source และเผยแพร่เวอร์ชันใหม่ผ่าน Sites workflow

รูปสินค้าที่ยังไม่ได้เพิ่มจะยังแสดงพื้นที่สำหรับรูปตามเดิม และเว็บนี้ยังไม่มีระบบรับหรือบันทึกออเดอร์
