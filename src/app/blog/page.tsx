import type { Metadata } from "next";
import StaticContentPage from "@/components/StaticContentPage";
import { buildPublicMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPublicMetadata({
  title: "Reseller Guides",
  description:
    "FlipIQ’s guide hub for resale profit, max buy price, sell-through rate, execution risk, and marketplace strategy.",
  path: "/blog",
});

export default function BlogPage() {
  return (
    <StaticContentPage
      eyebrow="Guides"
      title="Practical guides for buying, pricing, and selling better."
      intro="This section is where FlipIQ breaks down the metrics behind better resale decisions: profit, max buy price, sell-through, execution risk, and marketplace choice. The goal is to make the tool easier to trust because you understand how the signals work."
      sections={[
        {
          title: "What this hub will cover",
          bullets: [
            "How to calculate max buy price before fees and returns surprise you",
            "How to read sell-through rate without overestimating demand",
            "When Amazon profit beats eBay, and when it does not",
            "How to think about confidence, mixed conditions, and bad comps",
            "Which categories need more verification before you buy",
          ],
        },
        {
          title: "How to use the guides",
          paragraphs: [
            "Use the educational pages to build judgment, then use the calculator to make the actual decision faster. The content and the product should reinforce each other: one explains the model, the other applies it live.",
          ],
        },
        {
          title: "In the meantime",
          paragraphs: [
            "If you want the most direct version of FlipIQ, skip straight to the free calculator. That is the fastest way to see how the product thinks about a real sourcing decision.",
          ],
        },
      ]}
    />
  );
}
