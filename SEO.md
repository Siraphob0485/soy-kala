# SEO สำหรับร้านซอยกะลา

URL หลัก: https://soy-kala.phonglehanon.workers.dev/

## สิ่งที่ตั้งค่าแล้ว

- ชื่อหน้าและคำอธิบายเฉพาะแต่ละหน้า พร้อมชื่อร้าน จังหวัดนครนายก และรับผลิตจำนวนมาก/รายชิ้น
- canonical ของแต่ละหน้าใช้ URL ตัวเอง มี trailing slash ตรงกับ static export
- sitemap.xml สร้างจากหน้าหลัก 3 หน้าและข้อมูลสินค้าโดยอัตโนมัติ (ปัจจุบันรวม 8 URL)
- robots.txt อนุญาตให้ crawler อ่านเว็บและระบุ sitemap
- เพิ่มไฟล์ public/google4433851957e2d361.html ตามข้อมูลที่เจ้าของร้านให้ เพื่อยืนยัน Search Console แบบไฟล์ HTML (ยังต้องกดยืนยันในบัญชี Google)
- googleSiteVerification ใน src/config/site.ts เว้นว่างไว้ เพราะใช้วิธีไฟล์ HTML

ตรวจ URL หลัง Cloudflare deploy:

- https://soy-kala.phonglehanon.workers.dev/sitemap.xml
- https://soy-kala.phonglehanon.workers.dev/robots.txt

## เชื่อม Google Search Console

1. เข้าสู่ https://search.google.com/search-console ด้วยบัญชี Google ของเจ้าของร้าน
2. เพิ่มพร็อพเพอร์ตี้แบบ URL prefix เป็น https://soy-kala.phonglehanon.workers.dev/
3. เลือกวิธียืนยันไฟล์ HTML ที่ Google ให้ชื่อ google4433851957e2d361.html
4. ตรวจว่า https://soy-kala.phonglehanon.workers.dev/google4433851957e2d361.html แสดงข้อความ google-site-verification: google4433851957e2d361.html
5. ไฟล์นี้อยู่ใน public/ ต้องเก็บไว้หลังยืนยันสำเร็จเพื่อให้ Google ตรวจซ้ำได้
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
