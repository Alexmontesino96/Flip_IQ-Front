import type { ReactNode } from "react";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata = buildNoIndexMetadata({
  title: "Scan | FlipIQ",
  description: "Internal barcode scanning flow for FlipIQ analyses.",
});

export default function ScanLayout({ children }: { children: ReactNode }) {
  return children;
}
