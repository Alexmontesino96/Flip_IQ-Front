import type { ReactNode } from "react";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata = buildNoIndexMetadata({
  title: "Plans | FlipIQ",
  description: "Subscription and upgrade flows for FlipIQ users.",
});

export default function PlansLayout({ children }: { children: ReactNode }) {
  return children;
}
