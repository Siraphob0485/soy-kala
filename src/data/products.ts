import type { Product } from "@/types/product";

// ข้อมูลเริ่มต้นสำหรับพัฒนาเว็บ: เพิ่มรูป ขนาด และรายละเอียดจริงก่อนเผยแพร่
export const products: Product[] = [
  {
    id: "KALA-001",
    slug: "coconut-turtle",
    name: "เต่ากะลา",
    category: "ของที่ระลึก",
    description: "เต่าจากกะลามะพร้าวสำหรับตกแต่งหรือมอบเป็นของที่ระลึก สอบถามรูปแบบและจำนวนที่ต้องการได้",
    images: ["/images/products/turtle/turtle.jpg"],
    madeToOrder: true,
  },
  {
    id: "KALA-002",
    slug: "coconut-bowl",
    name: "ถ้วยกะลา",
    category: "ของใช้",
    description: "ถ้วยจากกะลามะพร้าว สอบถามขนาด ลักษณะงาน และการใช้งานที่เหมาะสมก่อนสั่งผลิต",
    images: ["/images/products/bowl/bowl (2).jpg"],
    madeToOrder: true,
  },
  {
    id: "KALA-003",
    slug: "coconut-soap-dish",
    name: "ที่วางสบู่กะลา",
    category: "ของใช้",
    description: "ที่วางสบู่จากกะลามะพร้าวสำหรับมุมอ่างล้างมือและห้องน้ำ สอบถามรายละเอียดการสั่งทำได้",
    images: [],
    madeToOrder: true,
  },
  {
    id: "KALA-004",
    slug: "coconut-lamp",
    name: "โคมไฟกะลา",
    category: "ของตกแต่ง",
    description: "โคมไฟจากกะลามะพร้าวสำหรับตกแต่งพื้นที่ พูดคุยเรื่องรูปแบบและรายละเอียดกับร้านก่อนสั่งผลิต",
    images: [],
    madeToOrder: true,
  },
  {
    id: "KALA-005",
    slug: "coconut-ladle",
    name: "กระบวยตักน้ำ",
    category: "ของใช้",
    description: "กระบวยจากกะลามะพร้าว สอบถามขนาดและรูปแบบด้ามที่ต้องการก่อนสั่งผลิต",
    images: [],
    madeToOrder: true,
  },
];

// เปลี่ยนฟังก์ชันเหล่านี้ไปอ่านฐานข้อมูลได้ในอนาคต
export function getProducts(): Product[] {
  return products;
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}
