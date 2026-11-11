"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type TouchEvent } from "react";
import ProductImage from "@/components/ProductImage";

export default function ProductPhotos({ images, name }: { images: string[]; name: string }) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const headingId = useId();
  const multiple = images.length > 1;

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [open]);

  function move(direction: number) {
    setIndex((current) => (current + direction + images.length) % images.length);
  }

  function finishSwipe(event: TouchEvent<HTMLDivElement>) {
    const start = swipe.current;
    swipe.current = null;
    if (!multiple || !start || event.changedTouches.length !== 1 || event.touches.length) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.25) move(dx < 0 ? 1 : -1);
  }

  if (!images.length) return <ProductImage name={name} />;

  return (
    <div className="product-photos">
      <button ref={trigger} type="button" className="photo-open" aria-label={`ดูภาพใหญ่ ${name} รูปที่ ${index + 1}`} aria-haspopup="dialog" onClick={() => { dialog.current?.showModal(); setOpen(true); }}>
        <span className="photo-preview">
          <Image src={images[index]} alt={`${name} รูปที่ ${index + 1}`} fill sizes="(max-width: 640px) 100vw, 50vw" loading="eager" />
        </span>
        <span className="photo-open-label"><span aria-hidden="true">⤢</span> แตะเพื่อดูภาพใหญ่</span>
      </button>
      {multiple && <div className="photo-thumbnails" role="group" aria-label={`เลือกรูป${name}`}>
        {images.map((src, photoIndex) => (
          <button key={`${src}-${photoIndex}`} type="button" className="photo-thumbnail" aria-label={`ดูรูปที่ ${photoIndex + 1} ของ ${name}`} aria-pressed={photoIndex === index} onClick={() => setIndex(photoIndex)}>
            <Image src={src} alt="" fill sizes="80px" />
          </button>
        ))}
      </div>}
      <p className="photo-caption" aria-live="polite">รูปที่ {index + 1} จาก {images.length}{multiple ? " · เลือกรูปด้านล่างภาพเพื่อดูมุมอื่น" : ""}</p>

      <dialog ref={dialog} className="photo-dialog" aria-labelledby={headingId} onClose={() => { setOpen(false); swipe.current = null; trigger.current?.focus({ preventScroll: true }); }} onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }} onKeyDown={(event) => {
        if (!multiple) return;
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); move(event.key === "ArrowRight" ? 1 : -1); }
      }}>
        <div className="photo-dialog-panel">
          <div className="photo-dialog-header">
            <h2 id={headingId}>{name}</h2>
            <button type="button" className="photo-control" onClick={() => dialog.current?.close()} autoFocus aria-label="ปิดภาพใหญ่">ปิด <span aria-hidden="true">×</span></button>
          </div>
          <div className="photo-stage" onTouchStart={(event) => { swipe.current = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null; }} onTouchMove={(event) => { if (event.touches.length !== 1) swipe.current = null; }} onTouchEnd={finishSwipe} onTouchCancel={() => { swipe.current = null; }}>
            {open && <Image src={images[index]} alt={`${name} รูปที่ ${index + 1} จาก ${images.length}`} fill sizes="(max-width: 1100px) 100vw, 1100px" loading="eager" draggable={false} />}
          </div>
          <div className="photo-dialog-controls">
            {multiple && <button type="button" className="photo-control" aria-label="รูปก่อนหน้า" onClick={() => move(-1)}>← ก่อนหน้า</button>}
            <p aria-live="polite" aria-atomic="true">รูปที่ {index + 1} / {images.length}</p>
            {multiple && <button type="button" className="photo-control" aria-label="รูปถัดไป" onClick={() => move(1)}>ถัดไป →</button>}
          </div>
          {multiple && <p className="photo-dialog-hint">ปัดซ้าย–ขวาบนภาพ หรือใช้ปุ่มลูกศรเพื่อเปลี่ยนรูป</p>}
        </div>
      </dialog>
    </div>
  );
}
