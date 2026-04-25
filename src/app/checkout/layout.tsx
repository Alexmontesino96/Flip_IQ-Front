import type { ReactNode } from "react";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata = buildNoIndexMetadata({
  title: "Checkout | FlipIQ",
  description: "Account and checkout flow for FlipIQ plans.",
});

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return children;
}
