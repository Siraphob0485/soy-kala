export const categories = ["ของใช้", "ของตกแต่ง", "ของที่ระลึก"];
export const MAX_PRODUCTS = 100;
export const MAX_IMAGES = 10;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function validImagePath(value) {
  return typeof value === "string" && value.length <= 250 &&
    (/^\/media\/[a-f0-9-]{36}\.(jpg|png|webp)$/.test(value) ||
      (/^\/images\/products\/[a-zA-Z0-9_ /().-]+\.(jpg|jpeg|png|webp)$/.test(value) && !value.includes("..")));
}

export function validateProduct(input) {
  if (!input || typeof input !== "object") throw new Error("ข้อมูลสินค้าไม่ถูกต้อง");
  const text = (key, max, required = true) => {
    const value = input[key];
    if (typeof value !== "string" || value.length > max || (required && !value.trim())) throw new Error(`กรุณาตรวจช่อง ${key}`);
    return value.trim();
  };
  const id = text("id", 40);
  const slug = text("slug", 80);
  if (!/^[A-Za-z0-9_-]+$/.test(id)) throw new Error("รหัสสินค้าใช้ตัวอักษรอังกฤษ ตัวเลข - และ _ ได้");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error("ลิงก์สินค้าใช้ภาษาอังกฤษตัวเล็ก ตัวเลข และขีดกลาง");
  if (!categories.includes(input.category)) throw new Error("กรุณาเลือกหมวดหมู่");
  if (!Array.isArray(input.images) || input.images.length > MAX_IMAGES || !input.images.every(validImagePath) || new Set(input.images).size !== input.images.length) throw new Error("รูปสินค้าต้องมาจากคลังรูปของร้านและไม่เกิน 10 รูป");
  if (typeof input.visible !== "boolean" || typeof input.madeToOrder !== "boolean") throw new Error("สถานะสินค้าไม่ถูกต้อง");
  return { id, slug, name: text("name", 120), category: input.category, description: text("description", 2000), dimensions: text("dimensions", 200, false), images: [...input.images], madeToOrder: input.madeToOrder, visible: input.visible };
}

export function validateCatalog(input) {
  if (!Array.isArray(input) || input.length > MAX_PRODUCTS) throw new Error("รายการสินค้าต้องไม่เกิน 100 รายการ");
  const products = input.map(validateProduct);
  for (const key of ["id", "slug"]) if (new Set(products.map(p => p[key])).size !== products.length) throw new Error("รหัสสินค้าและลิงก์ต้องไม่ซ้ำกัน");
  return products;
}

export function publicProducts(products) {
  return products.filter(p => p.visible).map(({ visible, ...product }) => product);
}

export function imageType(bytes) {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { mime: "image/jpeg", extension: "jpg" };
  if ([137, 80, 78, 71, 13, 10, 26, 10].every((n, i) => bytes[i] === n)) return { mime: "image/png", extension: "png" };
  const ascii = (start, length) => String.fromCharCode(...bytes.slice(start, start + length));
  if (ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP") return { mime: "image/webp", extension: "webp" };
  return null;
}
