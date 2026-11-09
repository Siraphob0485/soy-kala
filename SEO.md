# SEO สำหรับร้านซอยกะลา

URL หลัก: https://soy-kala.phonglehanon.workers.dev/

## สิ่งที่ตั้งค่าแล้ว

- ชื่อหน้าและคำอธิบายเฉพาะแต่ละหน้า พร้อมชื่อร้าน จังหวัดนครนายก และรับผลิตจำนวนมาก/รายชิ้น
- canonical ของแต่ละหน้าใช้ URL ตัวเอง มี trailing slash ตรงกับ static export
- sitemap.xml สร้างจากหน้าหลัก 3 หน้าและข้อมูลสินค้าโดยอัตโนมัติ (ปัจจุบันรวม 8 URL)
- robots.txt อนุญาตให้ crawler อ่านเว็บและระบุ sitemap
- เตรียม googleSiteVerification ใน src/config/site.ts แต่ยังไม่ได้ใส่รหัสหรือยืนยัน Search Console

ตรวจ URL หลัง Cloudflare deploy:

- https://soy-kala.phonglehanon.workers.dev/sitemap.xml
- https://soy-kala.phonglehanon.workers.dev/robots.txt

## เชื่อม Google Search Console

1. เข้าสู่ https://search.google.com/search-console ด้วยบัญชี Google ของเจ้าของร้าน
2. เพิ่มพร็อพเพอร์ตี้แบบ URL prefix เป็น https://soy-kala.phonglehanon.workers.dev/
3. เลือกวิธียืนยัน HTML tag แล้วคัดลอกแท็ก google-site-verification
4. ใส่เฉพาะค่า content ใน siteConfig.googleSiteVerification (หรือส่งแท็กให้ผู้ช่วยใส่) ไม่ใช่รหัสผ่านหรือ OTP
5. Build, commit และ push แล้วรอ Cloudflare deploy เวอร์ชันนั้น
6. กลับไปกด Verify ใน Search Console
7. เมนู Sitemaps: ส่ง sitemap.xml
8. ใช้ URL Inspection ตรวจหน้าแรกและสินค้าหลัก แล้ว Request indexing หากระบบอนุญาต

หากเพิ่มสินค้าหรือเปลี่ยนโดเมน ต้อง build และ deploy ใหม่ แก้ URL หลักที่ siteConfig.url และตั้ง property ใหม่ใน Search Console เมื่อย้ายโดเมน

## งานเนื้อหาต่อไป

เพิ่มรูปจริง ขนาด รูปแบบที่รับทำ วิธีดูแล เงื่อนไขสั่งซื้อ และระยะเวลาผลิตที่ร้านยืนยันได้ อย่าเพิ่มรีวิว คะแนน หรือข้อมูลธุรกิจที่สมมติขึ้น

คำค้นเริ่มต้น (ยังไม่ได้วิจัยปริมาณค้นหาหรือความยาก): เต่ากะลามะพร้าว, ถ้วยกะลามะพร้าว, รับผลิตของที่ระลึกจากกะลา

SEO ไม่รับประกันการจัดทำดัชนีหรืออันดับหน้าแรก

เอกสาร Google:
- https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- https://support.google.com/webmasters/answer/9008080
