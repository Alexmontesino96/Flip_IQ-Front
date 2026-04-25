import type { Metadata } from "next";
import StaticContentPage from "@/components/StaticContentPage";
import { buildPublicMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPublicMetadata({
  title: "About FlipIQ",
  description:
    "Learn what FlipIQ does for resellers, how it evaluates a product, and why execution matters as much as raw ROI.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <StaticContentPage
      eyebrow="About FlipIQ"
      title="FlipIQ helps resellers decide before they spend."
      intro="FlipIQ is built for one practical question: if you buy this product right now, are you likely to sell it profitably in the real world? The app combines marketplace comps, execution signals, and decision guidance so you can move faster with less guesswork."
      sections={[
        {
          title: "What FlipIQ actually does",
          paragraphs: [
            "FlipIQ analyzes live resale data and turns it into a buying decision. It estimates sale price, profit, max buy price, sell-through speed, confidence, and execution friction across marketplaces like eBay and Amazon.",
            "The goal is not to show big ROI numbers in isolation. The goal is to tell you whether the opportunity is actionable with the data available right now.",
          ],
        },
        {
          title: "Why execution matters",
          paragraphs: [
            "A product can look amazing on paper and still be a bad buy. Small sample sizes, mixed conditions, dominant sellers, unstable pricing, generic fees, or category-specific friction can make a flip far harder than raw profit suggests.",
            "That is why FlipIQ separates market opportunity from execution quality and pushes the recommendation toward more conservative guidance when the evidence is weak.",
          ],
        },
        {
          title: "Who it is for",
          paragraphs: [
            "FlipIQ is designed for resellers who source in the real world: thrift stores, garage sales, liquidation, clearance, estate sales, and everyday retail arbitrage.",
          ],
          bullets: [
            "Part-time flippers who need quick pass-or-buy decisions",
            "Experienced resellers who want faster pre-buy validation",
            "Operators comparing eBay and Amazon before committing cash",
          ],
        },
      ]}
    />
  );
}
