import type { ReactNode } from "react";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata = buildNoIndexMetadata({
  title: "Shared Analysis | FlipIQ",
  description: "Shared FlipIQ analysis page intended for direct sharing only.",
});

export default function SharedLayout({ children }: { children: ReactNode }) {
  return children;
}
