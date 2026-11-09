import Link from "next/link";
import ProductImage from "@/components/ProductImage";
import type { Product } from "@/types/product";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <article className="product-card">
      <Link href={`/products/${product.slug}`} className="product-link">
        <ProductImage src={product.images[0]} name={product.name} />
        <div className="card-body">
          <span className="eyebrow">{product.category}</span>
          <h3>{product.name}</h3>
          <p>{product.description}</p>
          <span className="text-link">ดูรายละเอียด →</span>
        </div>
      </Link>
    </article>
  );
}
