import Image from "next/image";

export default function ProductImage({ src, name }: { src?: string; name: string }) {
  return (
    <div className="product-image">
      {src ? (
        <Image src={src} alt={name} fill sizes="(max-width: 640px) 100vw, (max-width: 960px) 50vw, 33vw" />
      ) : (
        <div className="image-placeholder"><span aria-hidden="true">◒</span><span>{name}</span><small>พื้นที่สำหรับรูปสินค้าจริง</small></div>
      )}
    </div>
  );
}
