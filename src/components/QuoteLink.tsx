"use client";

import Link from "next/link";
import { useQuote } from "@/components/QuoteProvider";

export default function QuoteLink() {
  const { draft } = useQuote();
  return <Link href="/quote">รายการขอราคา{draft.items.length > 0 && <span className="quote-count">{draft.items.length}</span>}</Link>;
}
