"use client";

import NavigationLink from "@/components/NavigationLink";
import { useQuote } from "@/components/QuoteProvider";

export default function QuoteLink() {
  const { draft } = useQuote();
  return <NavigationLink href="/quote"><span>รายการขอราคา</span>{draft.items.length > 0 && <span className="quote-count">{draft.items.length}</span>}</NavigationLink>;
}
