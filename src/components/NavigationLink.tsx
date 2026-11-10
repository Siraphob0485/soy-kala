"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export default function NavigationLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  const currentPath = pathname.replace(/\/$/, "") || "/";
  const exact = currentPath === href;
  const active = exact || (href !== "/" && currentPath.startsWith(`${href}/`));

  return (
    <Link className="site-nav-link" href={href} data-active={active || undefined} aria-current={exact ? "page" : active ? "location" : undefined}>
      {children}
    </Link>
  );
}
