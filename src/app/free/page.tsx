import type { Metadata } from "next";
import FlipIQCalculator from "@/components/FlipIQCalculator";
import { buildPublicMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPublicMetadata({
  title: "Free Flip Profit Calculator for eBay and Amazon",
  description:
    "Use FlipIQ’s free flip profit calculator to estimate resale profit, max buy price, and best marketplace across eBay and Amazon.",
  path: "/free",
});

export default function FreePage() {
  return <FlipIQCalculator />;
}
