import type { ReactNode } from "react";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata = buildNoIndexMetadata({
  title: "Search | FlipIQ",
  description: "Internal product search flow for FlipIQ analyses.",
});

export default function SearchLayout({ children }: { children: ReactNode }) {
  return children;
}
