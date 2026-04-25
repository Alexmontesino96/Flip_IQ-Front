import type { Metadata } from "next";
import Landing from "@/components/Landing";
import { buildPublicMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPublicMetadata({
  title: "Know if you’ll actually sell before you buy",
  description:
    "FlipIQ helps resellers analyze profit, velocity, risk, and execution before buying inventory. Compare eBay, Amazon, and more in seconds.",
  path: "/",
});

export default function Home() {
  return <Landing />;
}
