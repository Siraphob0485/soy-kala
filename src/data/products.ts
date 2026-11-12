import type { Product } from "@/types/product";
import catalog from "./catalog.generated.json";

// Generated before each build from the published CMS snapshot.
// Keep the synchronous interface so server HTML, sitemap and quotation data agree.
export function getProducts(): Product[] {
  return catalog.products as Product[];
}
export function getProductBySlug(slug: string): Product | undefined {
  return getProducts().find(product => product.slug === slug);
}
