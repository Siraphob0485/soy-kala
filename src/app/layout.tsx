import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: siteConfig.name, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  verification: siteConfig.googleSiteVerification
    ? { google: siteConfig.googleSiteVerification }
    : undefined,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        <a className="skip-link" href="#main-content">ข้ามไปเนื้อหา</a>
        <header className="site-header">
          <div className="container header-inner">
            <Link className="brand" href="/">{siteConfig.name}<small>งานจากกะลามะพร้าว</small></Link>
            <nav aria-label="เมนูหลัก">
              <Link href="/">หน้าแรก</Link>
              <Link href="/products">สินค้า</Link>
              <Link href="/how-to-order">วิธีสั่งซื้อ</Link>
            </nav>
          </div>
        </header>
        <main id="main-content" className="container">{children}</main>
        <footer className="site-footer"><div className="container"><strong>{siteConfig.name}</strong><p>{siteConfig.description}</p></div></footer>
      </body>
    </html>
  );
}
