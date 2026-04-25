import type { ReactNode } from "react";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata = buildNoIndexMetadata({
  title: "Watchlist | FlipIQ",
  description: "Private watchlist management for FlipIQ users.",
});

export default function WatchlistLayout({ children }: { children: ReactNode }) {
  return children;
}
