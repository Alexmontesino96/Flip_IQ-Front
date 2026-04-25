import type { ReactNode } from "react";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata = buildNoIndexMetadata({
  title: "Analysis Result | FlipIQ",
  description: "Ephemeral analysis result page for FlipIQ users.",
});

export default function ResultLayout({ children }: { children: ReactNode }) {
  return children;
}
