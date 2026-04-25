import type { ReactNode } from "react";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata = buildNoIndexMetadata({
  title: "Setup | FlipIQ",
  description: "Initial account setup flow for FlipIQ users.",
});

export default function SetupLayout({ children }: { children: ReactNode }) {
  return children;
}
