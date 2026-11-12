import type { Metadata } from "next";
import AdminPanel from "@/components/AdminPanel";

export const metadata: Metadata = {
  title: "หลังบ้านซอยกะลา",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <section className="section admin-page"><p className="eyebrow">สำหรับเจ้าของร้าน</p><h1>จัดการสินค้า</h1><AdminPanel /></section>;
}
