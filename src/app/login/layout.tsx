import type { ReactNode } from "react";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata = buildNoIndexMetadata({
  title: "Login | FlipIQ",
  description: "Account login flow for FlipIQ users.",
});

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children;
}
