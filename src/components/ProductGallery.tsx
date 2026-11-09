"use client";

import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import { productCategories, type Product, type ProductCategory } from "@/types/product";

export default function ProductGallery({ products }: { products: Product[] }) {
  const [category, setCategory] = useState<ProductCategory | "ทั้งหมด">("ทั้งหมด");
  const visibleProducts = category === "ทั้งหมด" ? products : products.filter((product) => product.category === category);
  return (
    <>
      <div className="filters" role="group" aria-label="หมวดหมู่สินค้า">
        {(["ทั้งหมด", ...productCategories] as const).map((item) => (
          <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>
        ))}
      </div>
      <p className="result-count" role="status">พบสินค้า {visibleProducts.length} รายการ</p>
      <div className="product-grid">{visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      {visibleProducts.length === 0 && <p>ยังไม่มีสินค้าในหมวดหมู่นี้</p>}
    </>
  );
}
