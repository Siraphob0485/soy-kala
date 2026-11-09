import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductImage from "@/components/ProductImage";
import { getProducts, getProductBySlug } from "@/data/products";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getProducts().map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProductBySlug((await params).slug);
  if (!product) notFound();
  return {
    title: product.madeToOrder ? `${product.name} รับผลิตตามออเดอร์` : product.name,
    description: product.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const product = getProductBySlug((await params).slug);
  if (!product) notFound();
  return (
    <section className="section">
      <Link className="back-link" href="/products">← กลับไปดูสินค้าทั้งหมด</Link>
      <div className="product-detail">
        <div>
          <ProductImage src={product.images[0]} name={product.name} />
          {product.images.slice(1).map((src, index) => <ProductImage key={`${src}-${index}`} src={src} name={`${product.name} มุมที่ ${index + 2}`} />)}
        </div>
        <div>
          <p className="eyebrow">{product.category} · {product.id}</p>
          <h1>{product.name}</h1><p className="intro">{product.description}</p>
          {product.madeToOrder && <span className="badge">ผลิตตามออเดอร์</span>}
          <dl>
            <dt>ขนาด</dt><dd>{product.dimensions ?? "สอบถามรายละเอียดกับร้าน"}</dd>
            <dt>ราคาและระยะเวลาผลิต</dt><dd>สอบถามตามรูปแบบและจำนวนที่ต้องการ</dd>
          </dl>
          <Link href="/how-to-order#contact" className="button">ดูช่องทางสั่งทำ</Link>
        </div>
      </div>
    </section>
  );
}
