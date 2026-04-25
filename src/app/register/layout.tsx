import type { ReactNode } from "react";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata = buildNoIndexMetadata({
  title: "Register | FlipIQ",
  description: "Account registration flow for FlipIQ users.",
});

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return children;
}
