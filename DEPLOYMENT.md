# การเผยแพร่เว็บ Soy Kala

- URL: https://soy-kala-gallery.stormyorangutan.chatgpt.site
- ผู้ให้บริการ: Sites
- Site ID: appgprj_6af18276ad48819189b36ccd7dd6e50e
- สถานะเมื่อ 9 พฤศจิกายน 2026: เผยแพร่สำเร็จแบบส่วนตัว ยังต้องยืนยันการเปิดเป็นสาธารณะ
- Source สำหรับเผยแพร่: `.site-deploy/soy-kala/`
- Hosting manifest: `.site-deploy/soy-kala/.openai/hosting.json`

โปรเจกต์หลักยังใช้ Next.js แบบเดิม ชุดเผยแพร่ใช้ static export โดยตั้ง `output: "export"`, `trailingSlash: true` และ `images.unoptimized: true` ไฟล์เว็บอยู่ใน `out/`

## การอัปเดตครั้งถัดไป

การ push ไป GitHub ยังไม่ทำให้ Sites อัปเดตอัตโนมัติ ให้แก้ไฟล์ในโปรเจกต์หลักแล้วสั่งผู้ช่วยให้อัปเดต Site เดิม โดยใช้ Site ID ข้างบน ห้ามสร้าง Site ใหม่

ผู้ช่วยต้องซิงก์ source และรูปจากโปรเจกต์หลักไปยังชุดเผยแพร่ รักษา hosting manifest และ config สำหรับ static export เดิม จากนั้น build, ตรวจสอบ, ส่ง source และเผยแพร่เวอร์ชันใหม่ผ่าน Sites workflow

รูปสินค้าที่ยังไม่ได้เพิ่มจะยังแสดงพื้นที่สำหรับรูปตามเดิม และเว็บนี้ยังไม่มีระบบรับหรือบันทึกออเดอร์
