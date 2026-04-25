import type { ReactNode } from "react";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata = buildNoIndexMetadata({
  title: "Dashboard | FlipIQ",
  description: "Private FlipIQ dashboard for account holders.",
});

export default function HomeLayout({ children }: { children: ReactNode }) {
  return children;
}
