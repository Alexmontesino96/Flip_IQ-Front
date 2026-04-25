import type { ReactNode } from "react";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata = buildNoIndexMetadata({
  title: "History | FlipIQ",
  description: "Private analysis history for FlipIQ users.",
});

export default function HistoryLayout({ children }: { children: ReactNode }) {
  return children;
}
