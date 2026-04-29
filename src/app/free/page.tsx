import type { Metadata } from "next";
import FreePage from "@/components/FreePage";
import { buildPublicMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPublicMetadata({
  title: "Free Flip Profit Calculator for eBay and Amazon",
  description:
    "Use FlipIQ's free flip profit calculator to compare resale profit, max buy price, and execution across eBay and Amazon before you buy inventory.",
  path: "/free",
});

export default function FreeCalculatorPage() {
  return <FreePage />;
}
