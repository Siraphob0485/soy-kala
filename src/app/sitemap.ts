import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getProducts } from "@/data/products";

// ต้องสร้างตอน build เพราะเว็บนี้ใช้ output: "export"
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    "/products/",
    "/how-to-order/",
    ...getProducts().map((product) => `/products/${product.slug}/`),
  ];

  // ไม่ใส่ lastModified จนกว่าจะมีวันที่แก้เนื้อหาจริงของแต่ละหน้า
  return paths.map((path) => ({ url: new URL(path, siteConfig.url).href }));
}
