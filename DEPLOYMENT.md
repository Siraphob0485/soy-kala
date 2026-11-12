# การเผยแพร่เว็บ Soy Kala

## Cloudflare Workers + D1 + R2 (เว็บหลัก)

โปรเจกต์ตั้งค่า Next.js เป็น static export แล้ว `npm run build` ดึงสินค้าชุดเผยแพร่จาก CMS และสร้างไฟล์ใน `out/` ส่วน `wrangler.jsonc` เผยแพร่ Worker API และไฟล์เว็บพร้อมกัน ไม่ต้องใช้ OpenNext ดูการใช้งานหลังบ้านและ secrets ใน [CMS.md](CMS.md)

URL หลัก: https://soy-kala.phonglehanon.workers.dev

Bindings: D1 `soy-kala-cms` และ R2 `soy-kala-media` ห้ามเปลี่ยนเป็นการ deploy เฉพาะ assets เพราะ API หลังบ้านจะหายไป การเปลี่ยน schema ต้องรัน `npm run cms:migrate:remote` ก่อนใช้โค้ดที่ต้องการ schema ใหม่

ค่าบนหน้าตั้งค่า Cloudflare:

- Project name: `soy-kala`
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Path: `/`
- Build environment variables: ไม่ต้องเพิ่ม ค่า URL สาธารณะอยู่ใน `shared/cms-config.json`
- Worker secrets: `ADMIN_KEY_HASH` และ `DEPLOY_HOOK_URL` (ไม่ใส่ใน Git หรือ build logs)

Cloudflare ใช้ branch `main` มา build/deploy การแก้โค้ดต้อง commit/push ส่วนการแก้สินค้าผ่าน CMS กดเผยแพร่เพื่อเรียก deploy hook ได้เลย `prebuild` ดึง snapshot จาก `/api/catalog` และหยุด build หากดึงไม่ได้ เว็บเดิมจึงยังคงอยู่หาก build ล้มเหลว

การติดตั้งครั้งแรกในบัญชีใหม่ต้องสร้าง D1/R2, ใส่ bindings, รัน migrations, ตั้ง secrets และ deploy หนึ่งครั้งโดย `shared/cms-config.json` มี `enabled: false` ก่อน จากนั้นเปลี่ยนเป็น `true` และตั้ง URL ของเว็บใหม่ จึงเปิดการ build จาก CMS ได้ เว็บหลักตั้งขั้นตอนนี้แล้ว

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

## ชุด Sites เดิม (ไม่ใช่เว็บหลัก)

การ push ไป GitHub จะอัปเดต Cloudflare แต่ไม่อัปเดตชุด Sites เดิม ชุดนั้นเป็น static gallery และไม่มี API ของ CMS อย่าใช้แทนเว็บหลัก

หากต้องการอัปเดต Sites ภายหลัง ต้องออกแบบการเชื่อม API ให้เหมาะสมก่อน ไม่คัดลอก CMS ไปเผยแพร่เป็น static อย่างเดียว

รูปสินค้าที่ยังไม่ได้เพิ่มจะยังแสดงพื้นที่สำหรับรูปตามเดิม และเว็บนี้ยังไม่มีระบบรับหรือบันทึกออเดอร์
